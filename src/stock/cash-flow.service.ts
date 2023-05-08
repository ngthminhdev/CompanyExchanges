import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import {
  InvestorTypeEnum,
  TransactionTimeTypeEnum,
} from '../enums/common.enum';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import { StockService } from './stock.service';
import { InvestorTransactionResponse } from './responses/InvestorTransaction.response';
import { RedisKeys } from '../enums/redis-keys.enum';

@Injectable()
export class CashFlowService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly stockService: StockService,
  ) {}

  public async getSessionDate(
    table: string,
    column: string = 'date_time',
  ): Promise<SessionDatesInterface> {
    let dateColumn = column;
    if (column.startsWith('[')) {
      dateColumn = column.slice(1, column.length - 1);
    }

    const lastWeek = moment().subtract('1', 'week').format('YYYY-MM-DD');
    const lastMonth = moment().subtract('1', 'month').format('YYYY-MM-DD');
    const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
    const firstDateYear = moment().startOf('year').format('YYYY-MM-DD');

    const dates = await this.dbServer.query(`
            SELECT DISTINCT TOP 2 ${column} FROM ${table}
            WHERE ${column} IS NOT NULL ORDER BY ${column} DESC 
        `);

    const query: string = `
            SELECT TOP 1 ${column} FROM ${table}
            WHERE ${column} IS NOT NULL
            ORDER BY ABS(DATEDIFF(day, ${column}, @0))
            `;

    return {
      latestDate: dates[0]?.[dateColumn] || new Date(),
      previousDate: dates[1]?.[dateColumn] || new Date(),
      weekDate:
        (await this.dbServer.query(query, [lastWeek]))[0]?.[dateColumn] ||
        new Date(),
      monthDate:
        (await this.dbServer.query(query, [lastMonth]))[0]?.[dateColumn] ||
        new Date(),
      yearDate:
        (await this.dbServer.query(query, [lastYear]))[0]?.[dateColumn] ||
        new Date(),
      firstDateYear:
        (await this.dbServer.query(query, [firstDateYear]))[0]?.[dateColumn] ||
        new Date(),
    };
  }

  //Diễn biến giao dịch đầu tư
  async getInvestorTransactions(
    investorType: number,
    type: number,
  ): Promise<InvestorTransactionResponse[]> {
    const redisData = await this.redis.get<InvestorTransactionResponse[]>(
      `${RedisKeys.InvestorTransaction}:${type}:${investorType}`,
    );

    if (redisData) return redisData;

    const tickerPrice = await this.stockService.getTickerPrice();
    const { latestDate, weekDate, monthDate, firstDateYear } =
      await this.getSessionDate('[marketTrade].[dbo].[foreign]', 'date');
    let startDate!: Date | string;
    let table!: string;
    const query = (table): string => `
        select top 50 code,
            sum(buyVol) as buyVol, sum(sellVol) as sellVol,
            sum(buyVal) as buyVal, sum(sellVal) as sellVal
        from [marketTrade].[dbo].[${table}]
        where date >= @0 and date <= @1
        and type IN ('STOCK', 'ETF')
        group by code
        order by buyVol desc
    `;
    switch (investorType) {
      case InvestorTypeEnum.Foreign:
        table = 'foreign';
        break;
      case InvestorTypeEnum.Proprietary:
        table = 'proprietary';
        break;
      default:
        table = 'foreign';
        break;
    }

    switch (type) {
      case TransactionTimeTypeEnum.Latest:
        startDate = latestDate;
        break;
      case TransactionTimeTypeEnum.OneWeek:
        startDate = weekDate;
        break;
      case TransactionTimeTypeEnum.OneMonth:
        startDate = monthDate;
        break;
      default:
        startDate = firstDateYear;
        break;
    }

    const data = await this.dbServer.query(query(table), [
      startDate,
      latestDate,
    ]);

    await data.forEach((item) => {
      item.price = tickerPrice[item.code] || 0;
    });

    const mappedData = new InvestorTransactionResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.InvestorTransaction}:${type}:${investorType}`,
      mappedData,
    );

    return mappedData;
  }
}
