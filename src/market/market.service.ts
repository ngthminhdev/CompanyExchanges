import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { RedisKeys } from '../enums/redis-keys.enum';
import { MssqlService } from '../mssql/mssql.service';
import { SessionDatesInterface } from '../stock/interfaces/session-dates.interface';
import { UtilCommonTemplate } from '../utils/utils.common';
import { IPriceChangePerformance } from './interfaces/price-change-performance.interface';
import { LiquidityChangePerformanceResponse } from './responses/liquidity-change-performance.response';
import { PriceChangePerformanceResponse } from './responses/price-change-performance.response';
import { IndusLiquidityResponse } from './responses/indus-liquidity.response';
import { IndusLiquidityInterface } from './interfaces/indus-liquidity.interface';

@Injectable()
export class MarketService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly mssqlService: MssqlService,
  ) {}

  //Get the nearest day have transaction in session, week, month...
  public async getSessionDate(
    table: string,
    column: string = 'date',
    instance: any = this.dbServer,
  ): Promise<SessionDatesInterface> {
    const redisData = await this.redis.get<SessionDatesInterface>(
      `${RedisKeys.SessionDate}:${table}:${column}`,
    );
    if (redisData) return redisData;

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

    const result = {
      latestDate: UtilCommonTemplate.toDate(data[0][column]),
      lastFiveDate: UtilCommonTemplate.toDate(data[4][column]),
      lastQuarterDate: UtilCommonTemplate.toDate(data[5][column]),
      firstYearDate: UtilCommonTemplate.toDate(data[6][column]),
      lastYearDate: UtilCommonTemplate.toDate(data[7][column]),
    };

    await this.redis.set(`${RedisKeys.SessionDate}:${table}:${column}`, result);
    return result;
  }

  async getNearestDate(table: string, date: Date | string) {
    const query: string = `
      SELECT TOP 1 [date]
      FROM ${table}
      WHERE [date] IS NOT NULL
      AND [date] <= '${date}'
      ORDER BY [date] DESC
    `;

    return await this.mssqlService.getDate(query);
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
          (now.closePrice - other.closePrice) / nullif(other.closePrice, 0) * 100 as perChange
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
      order by perChange desc, other.code, other.date desc
    `;

    const data = await this.dbServer.query(query);

    const mappedData: IPriceChangePerformance[] =
      UtilCommonTemplate.transformData([...data], {
        latestDate,
        lastFiveDate,
        lastQuarterDate,
        firstYearDate,
        lastYearDate,
      });

    return new PriceChangePerformanceResponse().mapToList(
      _.take(_.orderBy(mappedData, 'perFive', 'desc'), 50),
    );
  }

  async liquidityChangePerformance(ex: string, industries: string[]) {
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);

    const redisData = await this.redis.get(
      `${RedisKeys.LiquidityChangePerformance}:${floor}:${inds}`,
    );
    if (redisData) return redisData;

    const quarterDate = UtilCommonTemplate.getPastDate(5);
    const latestQuarterDate = quarterDate[0];
    const secondQuarterDate = quarterDate[1];
    const yearQuarterDate = quarterDate[4];
    const fourYearsDate = moment(new Date(latestQuarterDate))
      .subtract(4, 'years')
      .format('YYYY/MM/DD');
    const timeQuery: string = `
      WITH data as (
              SELECT TOP 1 [date]
              FROM [marketTrade].dbo.tickerTradeVND
              WHERE [date] IS NOT NULL
              AND [date] <= '${latestQuarterDate}'
              ORDER BY [date] DESC
              UNION ALL
              SELECT TOP 1 [date]
              FROM [marketTrade].dbo.tickerTradeVND
              WHERE [date] IS NOT NULL
              AND [date] <= '${secondQuarterDate}'
              ORDER BY [date] DESC
              UNION ALL
              SELECT TOP 1 [date]
              FROM [marketTrade].dbo.tickerTradeVND
              WHERE [date] IS NOT NULL
              AND [date] <= '${yearQuarterDate}'
              ORDER BY [date] DESC
              UNION ALL
              SELECT TOP 1 [date]
              FROM [marketTrade].dbo.tickerTradeVND
              WHERE [date] IS NOT NULL
              AND [date] <= '${fourYearsDate}'
              ORDER BY [date] DESC
          )
          select * from data
    `;

    const dates = await this.dbServer.query(timeQuery);

    const query: string = `
        select
        other.date, other.code,
            (now.totalVal - other.totalVal) / nullif(other.totalVal, 0) * 100 as perChange
        from (
            select [date], t.code, totalVal
            from [marketTrade].dbo.tickerTradeVND t
            inner join [marketInfor].dbo.info i
            on i.code = t.code
            where [date] = @0 and i.LV2 in ${inds}
                and i.floor in ${floor} and i.type in ('STOCK', 'ETF')
        ) as now
        inner join (
                select [date], t.code, totalVal
            from [marketTrade].dbo.tickerTradeVND t
            inner join [marketInfor].dbo.info i
            on i.code = t.code
            where [date] in (@1, @2, @3)
            and i.LV2 in ${inds}
                and i.floor in ${floor} and i.type in ('STOCK', 'ETF')
        ) as other
        on now.date > other.date and now.code = other.code
        group by other.date, other.code, now.totalVal, other.totalVal
        order by perChange desc, other.code, other.date desc;
    `;
    const correctDate = [
      ...dates.map((i) => UtilCommonTemplate.toDate(i.date)),
    ];
    const data = await this.dbServer.query(query, correctDate);

    const mappedData: IPriceChangePerformance[] =
      UtilCommonTemplate.transformDataLiquid([...data], {
        latestQuarterDate: correctDate[0],
        secondQuarterDate: correctDate[1],
        yearQuarterDate: correctDate[2],
        fourYearsDate: correctDate[3],
      });

    const result = new LiquidityChangePerformanceResponse().mapToList(
      _.take(_.orderBy(mappedData, 'perQuarter', 'desc'), 50),
    );

    await this.redis.set(
      `${RedisKeys.LiquidityChangePerformance}:${floor}:${inds}`,
      result,
    );

    return result;
  }

  async marketCapChangePerformance(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.marketCapChange}:${floor}:${inds}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const date = (await Promise.all(
      UtilCommonTemplate.getPastDate(type, order).map(
        async (date: string) =>
          await this.getNearestDate(
            '[marketTrade].[dbo].[tickerTradeVND]',
            date,
          ),
      ),
    )) as string[];

    const { startDate, dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      SELECT
        now.date, now.industry,
        ((now.value - prev.value) / NULLIF(prev.value, 0)) * 100 AS perChange
      FROM
        (
          SELECT
            [date],
            i.LV2 as industry,
            sum(value) as value
          FROM [RATIO].[dbo].[ratio] t
          inner join marketInfor.dbo.info i
          on t.code = i.code
          WHERE [date] in ${dateFilter}
            and i.floor in ${floor}
            and i.type in ('STOCK', 'ETF')
            and i.LV2 in ${inds}
            and t.ratioCode = 'MARKETCAP'
          group by [date], i.LV2
        ) AS now
      INNER JOIN
        (
          SELECT
            [date],
            i.LV2 as industry,
            sum(value) as value
          FROM [RATIO].[dbo].[ratio] t
          inner join marketInfor.dbo.info i
          on t.code = i.code
          WHERE [date] = '${startDate}'
            and i.floor in ${floor}
            and i.type in ('STOCK', 'ETF')
            and i.LV2 in ${inds}
            and t.ratioCode = 'MARKETCAP'
          group by [date], i.LV2
        ) AS prev
      ON now.[date] >= prev.[date] and now.industry = prev.industry
      GROUP BY now.[date], now.industry, prev.[date], now.value, prev.value
      ORDER BY now.[date]
    `;

    const data = await this.mssqlService.query<IndusLiquidityInterface[]>(
      query,
    );

    const mappedData = new IndusLiquidityResponse().mapToList(
      _.orderBy(data, 'date'),
    );

    await this.redis.set(
      `${RedisKeys.marketCapChange}:${floor}:${inds}:${order}:${type}`,
      mappedData,
    );
    return mappedData;
  }

  async indsLiquidityChangePerformance(
    ex: string,
    industries: string[],
    type: number,
    order: number,
  ) {
    const inds: string = UtilCommonTemplate.getIndustryFilter(industries);
    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const redisData = await this.redis.get(
      `${RedisKeys.IndusLiquidity}:${floor}:${inds}:${order}:${type}`,
    );
    if (redisData) return redisData;

    const date = (await Promise.all(
      UtilCommonTemplate.getPastDate(type, order).map(
        async (date: string) =>
          await this.getNearestDate(
            '[marketTrade].[dbo].[tickerTradeVND]',
            date,
          ),
      ),
    )) as string[];

    const { startDate, dateFilter } = UtilCommonTemplate.getDateFilter(date);

    const query: string = `
      SELECT
        now.date, now.industry,
        ((now.totalVal - prev.totalVal) / NULLIF(prev.totalVal, 0)) * 100 AS perChange
      FROM
        (
          SELECT
            [date],
            i.LV2 as industry,
            sum(totalVal) as totalVal
          FROM [marketTrade].[dbo].[tickerTradeVND] t
          inner join marketInfor.dbo.info i
          on t.code = i.code
          WHERE [date] in ${dateFilter}
            and i.floor in ${floor}
            and i.type in ('STOCK', 'ETF')
            and i.LV2 in ${inds}
          group by [date], i.LV2
        ) AS now
      INNER JOIN
        (
          SELECT
            [date],
            i.LV2 as industry,
            sum(totalVal) as totalVal
          FROM [marketTrade].[dbo].[tickerTradeVND] t
          inner join marketInfor.dbo.info i
          on t.code = i.code
          WHERE [date] = '${startDate}'
            and i.floor in ${floor}
            and i.type in ('STOCK', 'ETF')
            and i.LV2 in ${inds}
          group by [date], i.LV2
        ) AS prev
      ON now.[date] >= prev.[date] and now.industry = prev.industry
      GROUP BY now.[date], now.industry, prev.[date], now.totalVal, prev.totalVal
      ORDER BY now.[date]
    `;
    const data = await this.mssqlService.query<IndusLiquidityInterface[]>(
      query,
    );

    const mappedData = new IndusLiquidityResponse().mapToList(
      _.orderBy(data, 'date'),
    );

    await this.redis.set(
      `${RedisKeys.IndusLiquidity}:${floor}:${inds}:${order}:${type}`,
      mappedData,
    );
    return mappedData;
  }
}
