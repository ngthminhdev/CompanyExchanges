import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { SessionDatesInterface } from '../stock/interfaces/session-dates.interface';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IPriceChangePerformance } from './interfaces/price-change-performance.interface';

@Injectable()
export class MarketService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
  ) {}

  //Get the nearest day have transaction in session, week, month...
  public async getSessionDate(
    table: string,
    column: string = 'date',
    instance: any = this.dbServer,
  ): Promise<SessionDatesInterface> {
    const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
    const firstDateYear = moment().startOf('year').format('YYYY-MM-DD');
    const quarterDate = moment()
      .subtract(1, 'quarter')
      .endOf('quarter')
      .format('YYYY-MM-DD');

    const query: string = `
          WITH data as (
              SELECT DISTINCT TOP 5 [date]
              FROM ${table}
              WHERE [date] IS NOT NULL 
              ORDER BY [date] DESC
              UNION ALL
              SELECT TOP 1 [date]
              FROM ${table}
              WHERE [date] IS NOT NULL
              AND [date] <= @0
              ORDER BY [date] DESC
              UNION ALL
              SELECT TOP 1 [date]
              FROM ${table}
              WHERE [date] IS NOT NULL
              AND [date] >= @1
              ORDER BY [date]
              UNION ALL
              SELECT TOP 1 [date]
              FROM ${table}
              WHERE [date] IS NOT NULL
              AND [date] >= @2
              ORDER BY [date]
          )
          select * from data
        `;

    const data = await instance.query(query, [
      quarterDate,
      firstDateYear,
      lastYear,
    ]);

    return {
      latestDate: UtilCommonTemplate.toDate(data[0][column]),
      lastFiveDate: UtilCommonTemplate.toDate(data[4][column]),
      lastQuarterDate: UtilCommonTemplate.toDate(data[5][column]),
      firstYearDate: UtilCommonTemplate.toDate(data[6][column]),
      lastYearDate: UtilCommonTemplate.toDate(data[7][column]),
    };
  }

  async priceChangePerformance(ex: string, industries: string[]) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const {
      latestDate,
      lastFiveDate,
      lastQuarterDate,
      firstYearDate,
      lastYearDate,
    } = await this.getSessionDate('[marketTrade].dbo.tickerTradeVND');

    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);

    const query: string = `
      select
          other.date, other.code,
          (now.closePrice - other.closePrice) / other.closePrice * 100 as perChange
      from (
          select [date], t.code, closePrice
          from [marketTrade].dbo.tickerTradeVND t
          inner join [marketInfor].dbo.info i
          on i.code = t.code
          where [date] = '${latestDate}' and i.LV2 in ${inds}
              and i.floor in ${floor} and i.type in ('STOCK', 'ETF')
      ) as now
      inner join (
              select [date], t.code, closePrice
          from [marketTrade].dbo.tickerTradeVND t
          inner join [marketInfor].dbo.info i
          on i.code = t.code
          where [date] in ('${lastFiveDate}', '${lastQuarterDate}', '${firstYearDate}', '${lastYearDate}') 
          and i.LV2 in ${inds}
              and i.floor in ${floor} and i.type in ('STOCK', 'ETF')
      ) as other
      on now.date > other.date and now.code = other.code
      group by other.date, other.code, now.closePrice, other.closePrice
      order by  other.code, other.date desc
    `;

    const data = await this.dbServer.query(query);

    const mappedData: IPriceChangePerformance[] =
      UtilCommonTemplate.transformData(data, {
        latestDate,
        lastFiveDate,
        lastQuarterDate,
        firstYearDate,
        lastYearDate,
      });

    return mappedData;
  }
}
