import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import {
  InvestorTypeEnum,
  TransactionTimeTypeEnum,
} from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { ExceptionResponse } from '../exceptions/common.exception';
import { UtilCommonTemplate } from '../utils/utils.common';
import { InvestorTransactionValueInterface } from './interfaces/investor-transaction-value.interface';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import { CashFlowValueResponse } from './responses/CashFlowValue.response';
import { InvestorTransactionResponse } from './responses/InvestorTransaction.response';
import { StockService } from './stock.service';
import { InvestorTransactionValueResponse } from './responses/InvestorTransactionValue.response';
import { LiquidityGrowthInterface } from './interfaces/liquidity-growth.interface';
import { LiquidityGrowthResponse } from './responses/LiquidityGrowth.response';
import { InvestorTransactionRatioInterface } from './interfaces/investor-transaction-ratio.interface';
import { InvestorTransactionRatioResponse } from './responses/InvestorTransactionRatio.response';

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
    column: string = 'date',
  ): Promise<SessionDatesInterface> {
    let dateColumn = column;
    if (column.startsWith('[')) {
      dateColumn = column.slice(1, column.length - 1);
    }

    const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
    const firstDateYear = moment().startOf('year').format('YYYY-MM-DD');

    const dates = await this.dbServer.query(`
            SELECT DISTINCT TOP 20 ${column} FROM ${table}
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
      weekDate: dates[4]?.[dateColumn] || new Date(),
      monthDate: dates[dates.length - 1]?.[dateColumn] || new Date(),
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

    await data.forEach((item: Record<string, number>) => {
      item.price = tickerPrice[item.code] || 0;
    });

    const mappedData = new InvestorTransactionResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.InvestorTransaction}:${type}:${investorType}`,
      mappedData,
    );

    return mappedData;
  }

  async getCashFlowValue(type: number): Promise<CashFlowValueResponse[]> {
    const redisData = await this.redis.get<CashFlowValueResponse[]>(
      `${RedisKeys.CashFlowValue}:${type}`,
    );

    if (redisData) return redisData;

    const tickerPrice = await this.stockService.getTickerPrice();
    const { latestDate, weekDate, monthDate, firstDateYear } =
      await this.stockService.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

    let startDate!: Date | string;
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
    const query: string = `
    select ticker as code,
       sum(om_value * (close_price + high + low) / 3)
    as cashFlowValue
    from [PHANTICH].[dbo].[database_mkt]
    where date_time >= @0 and date_time <= @1
    group by ticker
    order by cashFlowValue desc
    `;

    const data = await this.db.query(query, [startDate, latestDate]);

    await data.forEach((item: Record<string, number>) => {
      item.price = tickerPrice[item.code] || 0;
    });

    const mappedData = new CashFlowValueResponse().mapToList(
      UtilCommonTemplate.getTop10HighestAndLowestData(data, 'cashFlowValue'),
    );
    await this.redis.set(`${RedisKeys.CashFlowValue}:${type}`, mappedData);
    return mappedData;
  }

  async getInvestorTransactionsValue(): Promise<
    InvestorTransactionValueInterface[]
  > {
    const query: string = `
      select top 60 [code] as floor, [date], totalVal 
      from [marketTrade].[dbo].[indexTrade]
      where [code] in('VNINDEX', 'HNXINDEX', 'UPINDEX')
      order by [date] desc
    `;

    const data: InvestorTransactionValueInterface[] = await this.dbServer.query(
      query,
    );

    return new InvestorTransactionValueResponse().mapToList(data);
  }

  async getLiquidityGrowth(type: number) {
    const { latestDate, weekDate, monthDate, firstDateYear, yearDate } =
      await this.getSessionDate('[marketTrade].[dbo].[indexTrade]');

    let startDate!: any;
    switch (type) {
      case TransactionTimeTypeEnum.OneWeek:
        startDate = weekDate;
        break;
      case TransactionTimeTypeEnum.OneMonth:
        startDate = monthDate;
        break;
      case TransactionTimeTypeEnum.YearToDate:
        startDate = firstDateYear;
        break;
      case TransactionTimeTypeEnum.YearToYear:
        startDate = yearDate;
        break;
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }
    const query: string = `
      SELECT
        now.date, now.code as floor,
        ((now.totalVal - prev.totalVal) / NULLIF(prev.totalVal, 0)) * 100 AS perChange
      FROM
        (
          SELECT
            [date],
            code,
            totalVal
          FROM [marketTrade].[dbo].[indexTrade]
          WHERE [date] >= @0
          AND [date] <= @1
          AND [code] in ('VNINDEX', 'HNXINDEX', 'UPINDEX')
        ) AS now
      INNER JOIN
        (
          SELECT
            [date],
            code,
            totalVal
          FROM [marketTrade].[dbo].[indexTrade]
          WHERE [date] = @0
          AND [code] in ('VNINDEX', 'HNXINDEX', 'UPINDEX')
        ) AS prev
      ON now.[date] > prev.[date] and now.code = prev.code
      GROUP BY now.[date], now.[code], prev.[date], now.totalVal, prev.totalVal
      ORDER BY now.[date] ASC;
    `;
    console.log({ startDate, latestDate });

    const data: LiquidityGrowthInterface[] = await this.dbServer.query(query, [
      startDate,
      latestDate,
    ]);

    return new LiquidityGrowthResponse().mapToList([
      {
        floor: 'VNINDEX',
        perChange: 0,
        date: startDate,
      },
      {
        floor: 'HNXINDEX',
        perChange: 0,
        date: startDate,
      },
      {
        floor: 'UPINDEX',
        perChange: 0,
        date: startDate,
      },
      ...data,
    ]);
  }

  async getInvestorTransactionRatio() {
    const redisData = await this.redis.get(RedisKeys.InvestorTransactionRatio);
    if (redisData) return redisData;

    const query: string = `
    WITH market AS (
        SELECT
            [date],
            SUM(totalVal) AS marketTotalVal
        FROM [marketTrade].[dbo].[tickerTradeVND]
        WHERE [date] = (SELECT MAX([date]) FROM [marketTrade].[dbo].[proprietary])
            AND [type] IN ('STOCK', 'ETF')
        GROUP BY [date]
    ),
    data AS (
        SELECT
            p.[date],
            SUM(p.netVal) AS netVal,
            SUM(p.buyVal) AS buyVal,
            SUM(p.sellVal) AS sellVal,
            SUM(p.buyVal) + SUM(p.sellVal) AS totalVal,
            MAX(m.marketTotalVal) AS marketTotalVal,
            (SUM(p.buyVal) + SUM(p.sellVal)) / MAX(m.marketTotalVal) * 100 AS [percent],
            0 AS type
        FROM [marketTrade].[dbo].[proprietary] AS p
        INNER JOIN market AS m ON p.[date] = m.[date]
        WHERE p.[date] = (SELECT MAX([date]) FROM [marketTrade].[dbo].[proprietary])
            AND p.type IN ('STOCK', 'ETF')
        GROUP BY p.[date]
        UNION ALL
        SELECT
            f.[date],
            SUM(f.netVal) AS netVal,
            SUM(f.buyVal) AS buyVal,
            SUM(f.sellVal) AS sellVal,
            SUM(f.buyVal) + SUM(f.sellVal) AS totalVal,
            MAX(m.marketTotalVal) AS marketTotalVal,
            (SUM(f.buyVal) + SUM(f.sellVal)) / MAX(m.marketTotalVal) * 100 AS [percent],
            1 AS type
        FROM [marketTrade].[dbo].[foreign] AS f
        INNER JOIN market AS m ON f.[date] = m.[date]
        WHERE f.[date] = (SELECT MAX([date]) FROM [marketTrade].[dbo].[proprietary])
            AND f.type IN ('STOCK', 'ETF')
        GROUP BY f.[date]
    )
    SELECT
        [date], netVal, buyVal, sellVal,
        totalVal, marketTotalVal, [percent],
        0 AS type
    FROM data
    WHERE type = 0
    UNION ALL
    SELECT
        [date], netVal, buyVal, sellVal,
        totalVal, marketTotalVal, [percent],
        1 AS type
    FROM data
    WHERE type = 1
    UNION ALL
    SELECT
    [date],
    -(-SUM(CASE WHEN type = 0 THEN netVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN netVal ELSE 0 END)) AS netVal,
    marketTotalVal - (SUM(CASE WHEN type = 0 THEN buyVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN buyVal ELSE 0 END)) AS buyVal,
    marketTotalVal - (SUM(CASE WHEN type = 0 THEN sellVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN sellVal ELSE 0 END)) AS sellVal,
    (marketTotalVal * 2) - (SUM(CASE WHEN type = 0 THEN totalVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN totalVal ELSE 0 END)) AS totalVal,
    marketTotalVal,
    100 - SUM(CASE WHEN type = 0 THEN [percent] ELSE 0 END) - SUM(CASE WHEN type = 1 THEN [percent] ELSE 0 END) AS [percent],
    2 AS type
    FROM data
    GROUP BY marketTotalVal, [date];
    `;

    const data: InvestorTransactionRatioInterface[] = await this.dbServer.query(
      query,
    );

    const mappedData = new InvestorTransactionRatioResponse().mapToList(data);

    await this.redis.set(RedisKeys.InvestorTransactionRatio, mappedData);

    return mappedData;
  }

  async getInvestorTransactionCashFlowRatio(type: number, ex: string) {
    const redisData = await this.redis.get(
      `${RedisKeys.InvestorTransactionCashFlowRatio}:${type}:${ex}`,
    );
    if (redisData) return redisData;

    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;

    const { latestDate, previousDate, weekDate, monthDate, firstDateYear } =
      await this.getSessionDate('[marketTrade].[dbo].[proprietary]');

    let startDate!: any;
    switch (type) {
      case TransactionTimeTypeEnum.Latest:
        startDate = previousDate;
        break;
      case TransactionTimeTypeEnum.OneWeek:
        startDate = weekDate;
        break;
      case TransactionTimeTypeEnum.OneMonth:
        startDate = monthDate;
        break;
      case TransactionTimeTypeEnum.YearToDate:
        startDate = firstDateYear;
        break;
      case TransactionTimeTypeEnum.OneQuarter:
        startDate = moment().subtract(3, 'month').format('YYYY-MM-DD');
        break;
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }

    const query: string = `
    WITH market AS (
        SELECT
            [date],
            SUM(totalVal) AS marketTotalVal
        FROM [marketTrade].[dbo].[tickerTradeVND]
        WHERE [date] >= @0 and [date] <= @1
            AND [type] IN ('STOCK', 'ETF')
            AND [floor] IN ${floor}  
        GROUP BY [date]
    ),
    data AS (
        SELECT
            p.[date],
            SUM(p.netVal) AS netVal,
            SUM(p.buyVal) AS buyVal,
            SUM(p.sellVal) AS sellVal,
            SUM(p.buyVal) + SUM(p.sellVal) AS totalVal,
            MAX(m.marketTotalVal) AS marketTotalVal,
            (SUM(p.buyVal) + SUM(p.sellVal)) / MAX(m.marketTotalVal) * 100 AS [percent],
            0 AS type
        FROM [marketTrade].[dbo].[proprietary] AS p
        INNER JOIN market AS m ON p.[date] = m.[date]
        WHERE p.[date] >= @0 and p.[date] <= @1
            AND p.type IN ('STOCK', 'ETF')
            AND p.[floor] IN ${floor}  
        GROUP BY p.[date]
        UNION ALL
        SELECT
            f.[date],
            SUM(f.netVal) AS netVal,
            SUM(f.buyVal) AS buyVal,
            SUM(f.sellVal) AS sellVal,
            SUM(f.buyVal) + SUM(f.sellVal) AS totalVal,
            MAX(m.marketTotalVal) AS marketTotalVal,
            (SUM(f.buyVal) + SUM(f.sellVal)) / MAX(m.marketTotalVal) * 100 AS [percent],
            1 AS type
        FROM [marketTrade].[dbo].[foreign] AS f
        INNER JOIN market AS m ON f.[date] = m.[date]
        WHERE f.[date] >= @0 and f.[date] <= @1
            AND f.type IN ('STOCK', 'ETF')
            AND f.[floor] IN ${floor}  
        GROUP BY f.[date]
    )
    SELECT
        [date], netVal, buyVal, sellVal,
        totalVal, marketTotalVal, [percent],
        0 AS type
    FROM data
    WHERE type = 0
    UNION ALL
    SELECT
        [date], netVal, buyVal, sellVal,
        totalVal, marketTotalVal, [percent],
        1 AS type
    FROM data
    WHERE type = 1
    UNION ALL
    SELECT
      [date],
      -(-SUM(CASE WHEN type = 0 THEN netVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN netVal ELSE 0 END)) AS netVal,
      marketTotalVal - (SUM(CASE WHEN type = 0 THEN buyVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN buyVal ELSE 0 END)) AS buyVal,
      marketTotalVal - (SUM(CASE WHEN type = 0 THEN sellVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN sellVal ELSE 0 END)) AS sellVal,
      (marketTotalVal * 2) - (SUM(CASE WHEN type = 0 THEN totalVal ELSE 0 END) + SUM(CASE WHEN type = 1 THEN totalVal ELSE 0 END)) AS totalVal,
      marketTotalVal,
      100 - SUM(CASE WHEN type = 0 THEN [percent] ELSE 0 END) - SUM(CASE WHEN type = 1 THEN [percent] ELSE 0 END) AS [percent],
      2 AS type
    FROM data
    GROUP BY marketTotalVal, [date]
    ORDER BY [date] ASC
    `;

    const data: InvestorTransactionRatioInterface[] = await this.dbServer.query(
      query,
      [startDate, latestDate],
    );

    const mappedData = new InvestorTransactionRatioResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.InvestorTransactionCashFlowRatio}:${type}:${ex}`,
      mappedData,
    );

    return mappedData;
  }
}
