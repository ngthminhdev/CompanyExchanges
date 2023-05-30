import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MarketLiquidityChartResponse } from './responses/MarketLiquidityChart.response';
import { CatchException } from '../exceptions/common.exception';
import { Cache } from 'cache-manager';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MarketBreadthResponse } from './responses/MarketBreadth.response';
import { VnIndexResponse } from './responses/Vnindex.response';
import { TransactionTimeTypeEnum } from '../enums/common.enum';
import { StockService } from './stock.service';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import * as moment from 'moment';
import { RedisKeys } from '../enums/redis-keys.enum';
import { UtilCommonTemplate } from '../utils/utils.common';
import { LineChartResponse } from '../kafka/responses/LineChart.response';
import { GetLiquidityQueryDto } from './dto/getLiquidityQuery.dto';
import { TickerContributeResponse } from './responses/TickerContribute.response';
import { SelectorTypeEnum } from '../enums/exchange.enum';
import { MarketCashFlowResponse } from '../kafka/responses/MarketCashFlow.response';
import { DB_SERVER } from '../constants';
import { MarketBreadthByExResponse } from './responses/MarketBreadthByEx.response';
import { MssqlService } from '../mssql/mssql.service';
import { LineChartInterface } from '../kafka/interfaces/line-chart.interface';
import { TickerContributeInterface } from './interfaces/ticker-contribute.interface';

@Injectable()
export class ChartService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly stockService: StockService,
    private readonly mssqlService: MssqlService,
  ) {}

  timeCheck(): boolean {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      9,
      15,
      0,
    );

    if (now > start && now < end) {
      return false;
    }
    return true;
  }

  // Thanh khoản phiên trước
  async getMarketLiquidityYesterday() {
    try {
      const timeCheck = this.timeCheck();
      if (!timeCheck) return [];

      return new MarketLiquidityChartResponse().mapToList(
        await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[Liquidity_yesterday]
                ORDER BY time ASC
            `),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Thanh khoản phiên hiện tại
  async getMarketLiquidityToday() {
    try {
      const timeCheck = this.timeCheck();
      if (!timeCheck) return [];

      return new MarketLiquidityChartResponse().mapToList(
        await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[Liquidity_today]
                ORDER BY time ASC
            `),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  // Độ rộng ngành
  async getMarketBreadthNow() {
    try {
      const timeCheck = this.timeCheck();
      if (!timeCheck) return [];

      return new MarketBreadthResponse().mapToList(
        await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[MarketBreadth]
                ORDER BY time ASC
            `),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  // Chỉ số các index
  async getLineChart(type: number, index: string): Promise<any> {
    try {
      const { latestDate, weekDate, monthDate }: SessionDatesInterface =
        await this.stockService.getSessionDate(
          '[tradeIntraday].[dbo].[indexTradeVNDIntraday]',
          'date',
          this.dbServer,
        );

      let startDate: Date | string;
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
        case TransactionTimeTypeEnum.YearToDate:
          startDate = UtilCommonTemplate.toDateTime(moment().startOf('year'));
          break;
        default:
          startDate = latestDate;
      }

      const query: string = `
          select code      as comGroupCode,
                timeInday  as tradingDate,
                closePrice as indexValue,
                change     as indexChange,
                totalVol   as totalMatchVolume,
                totalVal   as totalMatchValue,
                perChange  as percentIndexChange
          from [tradeIntraday].[dbo].[indexTradeVNDIntraday]
          where code = '${index}'
              and date >= '${startDate}' and date <= '${latestDate}'
          order by code desc;
        `;

      const mappedData = new VnIndexResponse().mapToList(
        await this.mssqlService.query<LineChartInterface[]>(query),
        type,
      );

      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getLineChartNow(index: string): Promise<any> {
    try {
      const query: string = `
          select code      as comGroupCode,
                timeInday  as tradingDate,
                closePrice as indexValue,
                change     as indexChange,
                totalVol   as totalMatchVolume,
                totalVal   as totalMatchValue,
                perChange  as percentIndexChange
          from [tradeIntraday].[dbo].[indexTradeVNDIntraday]
          where code = '${index}'
              and date = (select max(date) from [tradeIntraday].[dbo].[indexTradeVNDIntraday])
          order by code desc;
        `;

      const data = await this.mssqlService.query<LineChartInterface[]>(query);
      return new LineChartResponse().mapToList(data);
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getTickerContribute(q: GetLiquidityQueryDto): Promise<any> {
    try {
      const { exchange, order, type } = q;

      const { latestDate, weekDate, monthDate, firstDateYear } =
        await this.stockService.getSessionDate(
          `[WEBSITE_SERVER].[dbo].[CPAH]`,
          'date',
          this.dbServer,
        );
      let endDate: Date | string;

      switch (+order) {
        case TransactionTimeTypeEnum.Latest:
          endDate = UtilCommonTemplate.toDate(latestDate);
          break;
        case TransactionTimeTypeEnum.OneWeek:
          endDate = UtilCommonTemplate.toDate(weekDate);
          break;
        case TransactionTimeTypeEnum.OneMonth:
          endDate = UtilCommonTemplate.toDate(monthDate);
          break;
        default:
          endDate = UtilCommonTemplate.toDate(firstDateYear);
          break;
      }

      const industryMap = {
        [SelectorTypeEnum.LV1]: ' c.LV1 ',
        [SelectorTypeEnum.LV2]: ' c.LV2 ',
        [SelectorTypeEnum.LV3]: ' c.LV3 ',
      };

      let industry = industryMap[+type] || ' c.LV3 ';
      const dateRangeFilter = ` date >= '${endDate}' and date <= '${UtilCommonTemplate.toDate(
        latestDate,
      )}' `;
      let query: string = `
               WITH temp AS (
                  SELECT ${industry} as symbol, sum(t.point) as contribute_price
                  FROM [WEBSITE_SERVER].[dbo].[CPAH] t
                  JOIN [marketInfor].[dbo].[info] c on c.code = t.symbol
                  WHERE ${dateRangeFilter} and ${industry} != ''
                  GROUP BY ${industry}
                )
                SELECT *
                FROM temp
                ORDER BY contribute_price DESC;
            `;

      if (+type == SelectorTypeEnum.Ticker) {
        query = `
                    WITH temp AS (
                      SELECT TOP 10 symbol, sum(point) as contribute_price
                      FROM [WEBSITE_SERVER].[dbo].[CPAH] 
                      WHERE ${dateRangeFilter} AND floor = '${exchange.toUpperCase()}'
                      GROUP BY symbol
                      ORDER BY contribute_price DESC
                      UNION ALL
                      SELECT TOP 10 symbol, sum(point) as contribute_price
                      FROM [WEBSITE_SERVER].[dbo].[CPAH] 
                      WHERE ${dateRangeFilter} AND floor = '${exchange.toUpperCase()}'
                      GROUP BY symbol
                      ORDER BY contribute_price ASC
                    )
                    SELECT *
                    FROM temp
                    ORDER BY
                    CASE
                    WHEN symbol IN (SELECT TOP 10 symbol FROM temp ORDER BY contribute_price ASC)
                    THEN 1
                    ELSE 0
                    END,
                    contribute_price DESC;
                `;
      }

      const data = await this.mssqlService.query<TickerContributeInterface[]>(
        query,
      );
      const mappedData = new TickerContributeResponse().mapToList(data);

      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getMarketCashFlow() {
    try {
      const query: string = `
        SELECT
        SUM(CASE WHEN changePrice1d > 0 THEN accumulatedVal ELSE 0 END) as increase,
        SUM(CASE WHEN changePrice1d < 0 THEN accumulatedVal ELSE 0 END) as decrease,
        SUM(CASE WHEN changePrice1d = 0 THEN accumulatedVal ELSE 0 END) as equal
        FROM
        [WEBSITE_SERVER].[dbo].[stock_value]
        WHERE [index] != 'VN30' AND [index] != 'HNX30';
      `;
      return new MarketCashFlowResponse((await this.db.query(query))![0]);
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getMarketBreadth(exchange: string, type: number) {
    try {
      //phien hien tai
      if (type === 0) {
        const timeCheck = this.timeCheck();
        if (!timeCheck) return [];
        let ex = exchange == 'HOSE' ? 'MarketBreadth' : 'MarketBreadthHNX';

        return new MarketBreadthResponse().mapToList(
          await this.db.query(`
                SELECT * FROM [WEBSITE_SERVER].[dbo].[${ex}]
                ORDER BY time ASC
            `),
        );
      }

      const redisData = await this.redis.get(
        `${RedisKeys.MarketBreadth}:${exchange}:${type}`,
      );
      if (redisData) return redisData;

      const { latestDate, monthDate, firstDateYear }: SessionDatesInterface =
        await this.stockService.getSessionDate(
          '[marketTrade].[dbo].[tickerTradeVND]',
          'date',
          this.dbServer,
        );
      let startDate: Date | string;
      switch (type) {
        case 1: //1 month
          startDate = monthDate;
          break;
        case 2: // 3 thang (quy')
          startDate = UtilCommonTemplate.toDate(moment().subtract(3, 'month'));
          break;
        case TransactionTimeTypeEnum.YearToDate:
          startDate = firstDateYear;
          break;
        default:
          startDate = latestDate;
      }

      const query: string = `
        select t.date as time, i.floor as [index], 
          sum(case when t.perChange > 0 then 1 else 0 end) as advance,
          sum(case when t.perChange < 0 then 1 else 0 end) as decline,
          sum(case when t.perChange = 0 then 1 else 0 end) as noChange
        from [marketTrade].[dbo].[tickerTradeVND] t
        left join [marketInfor].[dbo].[info] i on
            i.code = t.code
        where i.floor = @0 and i.type = 'STOCK'
          and (t.date >= @1 and t.date <= @2)
        group by t.date, i.floor
        order by t.date;
      `;
      const data = await this.dbServer.query(query, [
        exchange,
        startDate,
        latestDate,
      ]);
      const mappedData = new MarketBreadthByExResponse().mapToList(data);
      await this.redis.set(
        `${RedisKeys.MarketBreadth}:${exchange}:${type}`,
        mappedData,
      );
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
