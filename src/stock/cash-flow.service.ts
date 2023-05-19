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
import { InvestorTransactionRatioInterface } from './interfaces/investor-transaction-ratio.interface';
import { InvestorTransactionValueInterface } from './interfaces/investor-transaction-value.interface';
import { LiquidityGrowthInterface } from './interfaces/liquidity-growth.interface';
import { RsiInterface, TransactionGroup } from './interfaces/rsi.interface';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import { CashFlowValueResponse } from './responses/CashFlowValue.response';
import { IndustryCashFlowResponse } from './responses/IndustryCashFlow.response';
import { InvestorTransactionResponse } from './responses/InvestorTransaction.response';
import { InvestorTransactionRatioResponse } from './responses/InvestorTransactionRatio.response';
import { InvestorTransactionValueResponse } from './responses/InvestorTransactionValue.response';
import { LiquidityGrowthResponse } from './responses/LiquidityGrowth.response';
import { RsiResponse } from './responses/Rsi.response';
import { StockService } from './stock.service';
import { InvestorCashFlowByIndustryInterface } from './interfaces/investor-cash-flow-by-industry.interface';
import { InvestorCashFlowByIndustryResponse } from './responses/InvestorCashFlowByIndustry.response';
import { MarketTotalTransValueResponse } from './responses/MarketTotalTransValue.response';

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
      case InvestorTypeEnum.Retail:
        table = 'retail';
        break;
      default:
        throw new ExceptionResponse(
          HttpStatus.BAD_REQUEST,
          'investorType not found',
        );
    }

    const { latestDate, weekDate, monthDate, firstDateYear } =
      await this.getSessionDate(`[marketTrade].[dbo].[${table}]`, 'date');

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
      await this.getSessionDate('[marketTrade].[dbo].[tickerTradeVND]');

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
      select code,
        sum(omVol * (closePrice * 1000 + highPrice * 1000 + lowPrice * 1000) / 3)
      as cashFlowValue
      from [marketTrade].[dbo].[tickerTradeVND]
      where [date] >= @0 and [date] <= @1
      group by code
      order by cashFlowValue desc
    `;

    const data = await this.dbServer.query(query, [startDate, latestDate]);

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
            1 AS type
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
            0 AS type
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

  async getIndustryCashFlow(type: number, ex: string) {
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
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }

    const query: string = `
      select
          now.[type],
          now.[date],
          now.[industry],
          (sum(now.transValue) - sum(prev.transValue)) / NULLIF(SUM(prev.transValue), 0)  * 100 as perChange
      from (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 0 as type
      from [marketTrade].[dbo].[foreign] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @1
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) now inner join (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 0 as type
      from [marketTrade].[dbo].[foreign] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @0
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) prev
      on now.industry = prev.industry
      group by now.[date], now.[industry], now.[type]
      union all
      select
          now.[type],
          now.[date],
          now.[industry],
          (sum(now.transValue) - sum(prev.transValue)) / NULLIF(SUM(prev.transValue), 0)  * 100 as perChange
      from (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 1 as type
      from [marketTrade].[dbo].[proprietary] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @1
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) now inner join (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 1 as type
      from [marketTrade].[dbo].[proprietary] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @0
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) prev
      on now.industry = prev.industry
      group by now.[date], now.[industry], now.[type]
      union all
      select
          now.[type],
          now.[date],
          now.[industry],
          (sum(now.transValue) - sum(prev.transValue)) / NULLIF(SUM(prev.transValue), 0)  * 100 as perChange
      from (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 2 as type
      from [marketTrade].[dbo].[retail] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @1
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) now inner join (
      select
          sum(buyVal) + sum(sellVal) AS transValue,
          i.LV2 AS industry, [date], 2 as type
      from [marketTrade].[dbo].[retail] t
      join [marketInfor].[dbo].[info] i on t.code = i.code
      where [date] = @0
      and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      and i.floor in ${floor}
      group by LV2, [date]
      ) prev
      on now.industry = prev.industry
      group by now.[date], now.[industry], now.[type];
    `;

    const data = await this.dbServer.query(query, [startDate, latestDate]);

    const result = data.reduce((acc, curr) => {
      const existingItem = acc.find((item) => item.industry === curr.industry);

      if (existingItem) {
        if (curr.type === 0) {
          existingItem.foreignPerChange = curr.perChange;
        } else if (curr.type === 1) {
          existingItem.proprietaryPerChange = curr.perChange;
        } else if (curr.type === 2) {
          existingItem.retailPerChange = curr.perChange;
        }
      } else {
        const newItem = {
          date: curr.date,
          industry: curr.industry,
          foreignPerChange: 0,
          proprietaryPerChange: 0,
          retailPerChange: 0,
        };

        if (curr.type === 0) {
          newItem.foreignPerChange = curr.perChange;
        } else if (curr.type === 1) {
          newItem.proprietaryPerChange = curr.perChange;
        } else if (curr.type === 2) {
          newItem.retailPerChange = curr.perChange;
        }

        acc.push(newItem);
      }

      return acc;
    }, []);

    const mappedData = new IndustryCashFlowResponse().mapToList(result);

    return mappedData;
  }

  async getRSI(session: number = 20, ex: string): Promise<RsiResponse[]> {
    const redisData = await this.redis.get<RsiResponse[]>(
      `${RedisKeys.Rsi}:${ex}:${session}`,
    );
    if (redisData) return redisData;

    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;
    const query = (count: number): string => `
                select sum(totalVal) AS transaction_value, 
                LV2 AS industry, [date] from [marketTrade].[dbo].[tickerTradeVND] t
                join [marketInfor].[dbo].[info] i on t.code = i.code
                where [date]
                in (select distinct top ${count + 1} [date] from 
                    [marketTrade].[dbo].[tickerTradeVND] order by [date] desc)
                    AND i.LV2 != '' AND i.floor in ${floor}
                    AND i.type in ('STOCK', 'ETF')
                group by LV2, [date]
                order by LV2, [date];
            `;
    const data: RsiInterface[] = await this.dbServer.query(query(session));

    // This function calculates the relative strength index (RSI) of cash gains and losses by industry.
    // It takes in an array of transaction data and returns an object with the RSI for each industry.

    const cashByIndustry: { [key: string]: TransactionGroup } = {};
    let previousTransaction = data[0];
    for (let i = 1; i < data.length; i++) {
      const currentTransaction = data[i];
      if (currentTransaction.industry === previousTransaction.industry) {
        const diff =
          currentTransaction.transaction_value -
          previousTransaction.transaction_value;
        if (!cashByIndustry[currentTransaction.industry]) {
          cashByIndustry[currentTransaction.industry] = {
            cashGain: 0,
            cashLost: 0,
          };
        }
        if (diff > 0) {
          cashByIndustry[currentTransaction.industry].cashGain++;
        } else if (diff < 0) {
          cashByIndustry[currentTransaction.industry].cashLost++;
        }
      }
      previousTransaction = currentTransaction;
    }

    const mappedData: RsiResponse[] = [];
    for (const item in cashByIndustry) {
      const { cashGain, cashLost } = cashByIndustry[item];
      const rsCash: number = cashGain / cashLost || 0;
      mappedData.push({
        industry: item,
        cashGain,
        cashLost,
        rsCash,
        rsiCash: 100 - 100 / (1 + rsCash),
      });
    }
    await this.redis.set(`${RedisKeys.Rsi}:${ex}:${session}`, mappedData);
    return mappedData;
  }

  async getTopNetBuyIndustry(type: number, ex: string) {
    const redisData = await this.redis.get(
      `${RedisKeys.TopNetBuyIndustry}:${type}:${ex}`,
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
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }

    const query: string = `
      CREATE TABLE ##TOP_TABLE (
          industry nvarchar(255),
          netBuyVal float,
          sellVal float,
          buyVal float,
          type float,
      );

      INSERT INTO
          ##TOP_TABLE(industry, netBuyVal, sellVal, buyVal, type)
      SELECT TOP 1 i.LV2 AS industry,
          SUM(f.netVal) AS netBuyVal,
          SUM(f.sellVal) AS sellVal,
          SUM(f.buyVal) AS buyVal, 0 AS type
      FROM [marketTrade].dbo.[foreign] f
      INNER JOIN [marketInfor].dbo.info i ON i.code = f.code
      WHERE [date] >= @0 and [date] <= @1 AND i.type IN ('STOCK', 'ETF')
          AND i.floor IN ${floor} AND f.netVal > 0
      GROUP BY i.LV2
      ORDER BY netBuyVal DESC;

      INSERT INTO
          ##TOP_TABLE(industry, netBuyVal, sellVal, buyVal, type)
      SELECT TOP 1 i.LV2 AS industry,
          SUM(p.netVal) AS netBuyVal,
          SUM(p.sellVal) AS sellVal,
          SUM(p.buyVal) AS buyVal, 1 AS type
      FROM [marketTrade].dbo.[proprietary] p
      INNER JOIN [marketInfor].dbo.info i ON i.code = p.code
      WHERE [date] >= @0 and [date] <= @1 AND i.type IN ('STOCK', 'ETF')
        AND i.floor IN ${floor} AND p.netVal > 0
      GROUP BY i.LV2
      ORDER BY netBuyVal DESC;

      INSERT INTO
          ##TOP_TABLE(industry, netBuyVal, sellVal, buyVal, type)
      SELECT TOP 1 i.LV2 AS industry,
          SUM(p.netVal) AS netBuyVal,
          SUM(p.sellVal) AS sellVal,
          SUM(p.buyVal) AS buyVal, 2 AS type
      FROM [marketTrade].dbo.[retail] p
      INNER JOIN [marketInfor].dbo.info i ON i.code = p.code
      WHERE [date] >= @0 and [date] <= @1 AND i.type IN ('STOCK', 'ETF')
        AND i.floor IN ${floor} AND p.netVal > 0
      GROUP BY i.LV2
      ORDER BY netBuyVal DESC;

      SELECT * FROM ##TOP_TABLE;

      DROP TABLE ##TOP_TABLE;
    `;

    const data = await this.dbServer.query(query, [startDate, latestDate]);
    await this.redis.set(`${RedisKeys.TopNetBuyIndustry}:${type}:${ex}`, data);
    return data;
  }

  async getInvestorCashFlowByIndustry(
    investorType: number,
    type: number,
    ex: string,
  ) {
    const redisData = await this.redis.get(
      `${RedisKeys.InvestorCashFlowByIndustry}:${ex}:${type}:${investorType}`,
    );
    if (redisData) return redisData;

    let investor!: string;

    switch (investorType) {
      case InvestorTypeEnum.Foreign:
        investor = 'foreign';
        break;
      case InvestorTypeEnum.Proprietary:
        investor = 'proprietary';
        break;
      case InvestorTypeEnum.Retail:
        investor = 'retail';
        break;
      default:
        throw new ExceptionResponse(
          HttpStatus.BAD_REQUEST,
          'investor not found',
        );
    }

    const { latestDate, monthDate, yearDate } = await this.getSessionDate(
      `[marketTrade].[dbo].[proprietary]`,
    );

    let startDate!: any;
    switch (type) {
      case TransactionTimeTypeEnum.OneMonth:
        startDate = monthDate;
        break;
      case TransactionTimeTypeEnum.OneQuarter:
        startDate = moment().subtract(3, 'month').format('YYYY-MM-DD');
        break;
      case TransactionTimeTypeEnum.YearToYear:
        startDate = yearDate;
        break;
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }

    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;

    const query: string = `
      SELECT t.industry,
            t.buyVal,
            t.sellVal,
            t.netVal,
            t.transVal,
            t.type,
            t.date,
            m.marketTotalVal,
            (t.transVal / NULLIF(m.marketTotalVal,0) * 100) as [percent]
      FROM(
          SELECT i.LV2 AS industry,
                SUM(f.buyVal) AS buyVal,
                SUM(f.sellVal) AS sellVal,
                SUM(f.netVal) AS netVal,
                SUM(f.buyVal) + SUM(f.sellVal) AS transVal,
                ${investorType} AS type,
                f.[date]
          FROM [marketTrade].dbo.[${investor}] f
          INNER JOIN [marketInfor].dbo.[info] i ON i.code = f.code
          WHERE f.[date] >= @0
            AND f.[date] <= @1
            AND i.floor IN ${floor}
            AND i.LV2 != ''
          GROUP BY f.[date], i.LV2
      ) t
      INNER JOIN (
          SELECT f.[date], SUM(f.buyVal) + SUM(f.sellVal) AS marketTotalVal
          FROM [marketTrade].dbo.[${investor}] f
          INNER JOIN [marketInfor].dbo.[info] i ON i.code = f.code
          WHERE f.[date] >= @0
            AND f.[date] <= @1
            AND i.floor IN ${floor}
            AND i.LV2 != ''
          GROUP BY f.[date]
      ) m ON t.date = m.date
      ORDER BY t.date;
    `;

    const data: InvestorCashFlowByIndustryInterface[] =
      await this.dbServer.query(query, [startDate, latestDate]);

    const mappedData = new InvestorCashFlowByIndustryResponse().mapToList(data);

    await this.redis.set(
      `${RedisKeys.InvestorCashFlowByIndustry}:${ex}:${type}:${investorType}`,
      mappedData,
    );
    return mappedData;
  }

  async getTotalTransactionValue(type: number, ex: string) {
    const { latestDate, monthDate, yearDate } = await this.getSessionDate(
      '[marketTrade].[dbo].[tickerTradeVND]',
    );

    const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;

    let startDate!: any;
    switch (type) {
      case TransactionTimeTypeEnum.OneMonth:
        startDate = monthDate;
        break;
      case TransactionTimeTypeEnum.OneQuarter:
        startDate = moment().subtract(3, 'month').format('YYYY-MM-DD');
        break;
      case TransactionTimeTypeEnum.YearToYear:
        startDate = yearDate;
        break;
      default:
        throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'type not found');
    }

    const query: string = `
      select
          i.LV2 as industry,
          [date],
          sum(totalVal) as marketTotalVal
      from marketTrade.dbo.tickerTradeVND t
      inner join marketInfor.dbo.info i on i.code = t.code
      where [date] >= @0 and [date] <= @1
      and i.floor in ${floor} and i.type in ('STOCK', 'ETF')
      and i.LV2 != ''
      group by i.LV2, [date]
      order by [date], i.LV2
    `;

    const data = await this.dbServer.query(query, [startDate, latestDate]);

    const mappedData = new MarketTotalTransValueResponse().mapToList(data);

    return mappedData;
  }
}
