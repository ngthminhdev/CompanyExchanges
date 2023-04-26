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
import { IndexQueryDto } from './dto/indexQuery.dto';

@Injectable()
export class ChartService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    private readonly stockService: StockService,
  ) {}

  // Thanh khoản phiên trước
  async getMarketLiquidityYesterday() {
    try {
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
  async getMarketBreadth() {
    try {
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
      const industryFull = await this.redis.get(RedisKeys.IndustryFull);
      if (type === TransactionTimeTypeEnum.Latest) {
        const data = await this.db.query(`
                    SELECT comGroupCode, indexValue, tradingDate,
                        openIndex, closeIndex, highestIndex, lowestIndex, referenceIndex
                    FROM [WEBSITE_SERVER].[dbo].[index_realtime]
                    WHERE comGroupCode = '${index}'
                    ORDER BY tradingDate ASC
                `);

        return {
          lineChartData: new LineChartResponse().mapToList(data),
          industryFull,
        };
      }
      const redisData: VnIndexResponse[] = await this.redis.get(
        `${RedisKeys.VnIndex}:${type}:${index}`,
      );
      if (redisData) return { lineChartData: redisData, industryFull };

      const { latestDate, weekDate, monthDate }: SessionDatesInterface =
        await this.stockService.getSessionDate(
          '[PHANTICH].[dbo].[database_chisotoday]',
        );
      let startDate: Date | string;
      switch (type) {
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
                select ticker as comGroupCode, close_price as indexValue, date_time as tradingDate
                from [PHANTICH].[dbo].[database_chisotoday]
                where ticker = '${index}' and date_time >= @0 and date_time <= @1
                ORDER BY date_time
            `;

      const mappedData = new VnIndexResponse().mapToList(
        await this.db.query(query, [startDate, latestDate]),
        type,
      );
      await this.redis.set(`${RedisKeys.VnIndex}:${type}:${index}`, mappedData);
      return { lineChartData: mappedData, industryFull };
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getVnIndexNow(): Promise<any> {
    try {
      const data = await this.db.query(`
                    SELECT * FROM [WEBSITE_SERVER].[dbo].[VNI_realtime]
                    ORDER BY tradingDate ASC
                `);
      return new LineChartResponse().mapToList(data);
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getLineChartNow(index: string): Promise<any> {
    try {
      const data = await this.db.query(`
                    SELECT comGroupCode, indexValue, tradingDate FROM [WEBSITE_SERVER].[dbo].[index_realtime]
                    WHERE comGroupCode = '${index}'
                    ORDER BY tradingDate ASC
                `);
      return new LineChartResponse().mapToList(data);
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getTickerContribute(q: GetLiquidityQueryDto): Promise<any> {
    try {
      const { exchange, order, type } = q;
      const redisData = await this.redis.get(
        `${RedisKeys.TickerContribute}:${type}:${order}:${exchange}`,
      );
      if (redisData) return redisData;

      const ex: string =
        exchange.toUpperCase() === 'UPCOM' ? 'UPCoM' : exchange.toUpperCase();

      const { latestDate, weekDate, monthDate, firstDateYear } =
        await this.stockService.getSessionDate(
          `[COPHIEUANHHUONG].[dbo].[${ex}]`, 'date'
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
                  SELECT ${industry} as symbol, sum(diemanhhuong) as contribute_price
                  FROM [COPHIEUANHHUONG].[dbo].[${ex}] t
                  JOIN [WEBSITE_SERVER].[dbo].[ICBID] c on c.TICKER = t.ticker
                  WHERE ${dateRangeFilter} and ${industry} != '#N/A'
                  GROUP BY ${industry}
                )
                SELECT *
                FROM temp
                ORDER BY contribute_price DESC;
            `;

      if (+type == SelectorTypeEnum.Ticker) {
        query = `
                    WITH temp AS (
                      SELECT TOP 10 ticker as symbol, sum(diemanhhuong) as contribute_price
                      FROM [COPHIEUANHHUONG].[dbo].[${ex}] 
                      WHERE ${dateRangeFilter}
                      GROUP BY ticker
                      ORDER BY contribute_price DESC
                      UNION ALL
                      SELECT TOP 10 ticker as symbol, sum(diemanhhuong) as contribute_price
                      FROM [COPHIEUANHHUONG].[dbo].[${ex}] 
                      WHERE ${dateRangeFilter}
                      GROUP BY ticker
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

      const data = await this.db.query(query);
      const mappedData = new TickerContributeResponse().mapToList(data);
      await this.redis.set(
        `${RedisKeys.TickerContribute}:${type}:${order}:${exchange}`,
        mappedData,
      );
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
