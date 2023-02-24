import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { RedisKeys } from '../enums/redis-keys.enum';
import { CatchException } from '../exceptions/common.exception';
import { MarketBreadthInterface } from '../interfaces/market-breadth.interface';
import { MarketVolatilityInterface } from '../interfaces/market-volatility.interfaces';
import { MarketBreadthRespone } from '../responses/MarketBreadth.response';
import { MarketVolatilityResponse } from '../responses/MarketVolatiliy.response';

@Injectable()
export class StockService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
  ) {}

  //Biến động thị trường
  async getMarketVolatility(): Promise<MarketVolatilityResponse[]> {
    try {
      const result: MarketVolatilityInterface[] = await this.db.query(
        `SELECT TOP(6) * FROM [PHANTICH].[dbo].[database_chisotoday]
        WHERE date_time >= DATEADD(day, -2, GETDATE()) AND date_time < GETDATE()`,
      );

      return new MarketVolatilityResponse().mapToList(result);
    } catch (error) {
      throw new CatchException(error);
    }
  }

  //Thanh khoản
  async getMarketLiquidity() {
    try {
      const result: any = await this.db.query(`
        SELECT indus.[LV2] AS industry, SUM(price.[total_value_mil]) AS total_value
        FROM [PHANTICH].[dbo].[ICBID] indus
        JOIN [PHANTICH].[dbo].[database_mkt] price
        ON indus.[TICKER] = price.[ticker]
        WHERE price.[date_time] >= DATEADD(day, -2, GETDATE()) AND date_time < GETDATE()
        GROUP BY indus.[LV2]
      `);

      return result;
    } catch (error) {
      throw new CatchException(error);
    }
  }

  //Độ rộng ngành
  async getMarketBreadth() {
    try {
      //Check caching data is existed
      const redisData: string = await this.redis.get(RedisKeys.MarketBreadth);
      if (redisData) return redisData;

      const result: MarketBreadthInterface[] =
        new MarketBreadthRespone().mapToList(
          await this.db.query(`
      SELECT
      company.LV2 AS industry,
      SUM(
        CASE WHEN price.close_price = prev_price.ref_price
          THEN 1
          ELSE 0
        END
      ) AS equal,
      SUM(
        CASE WHEN price.close_price >= prev_price.high 
          AND price.close_price != prev_price.ref_price
          THEN 1
          ELSE 0
        END
      ) AS high,
      SUM(
        CASE WHEN price.close_price <= prev_price.low 
          AND price.close_price != prev_price.ref_price
          THEN 1
          ELSE 0
        END
      ) AS low,
      SUM(
        CASE WHEN price.close_price > prev_price.ref_price 
          AND price.close_price < prev_price.high 
          THEN 1
          ELSE 0
        END
      ) AS increase,
      SUM(
        CASE WHEN price.close_price < prev_price.ref_price
          AND price.close_price > prev_price.low 
          THEN 1
          ELSE 0
        END
      ) AS decrease
    FROM (
      SELECT TICKER, LV2
      FROM PHANTICH.dbo.ICBID
    ) company
    JOIN PHANTICH.dbo.database_mkt price 
      ON company.TICKER = price.ticker
    JOIN (
      SELECT ticker, close_price, ref_price, high, low
      FROM PHANTICH.dbo.database_mkt 
      WHERE date_time = DATEADD(day, -2, CAST(GETDATE() AS date))
    ) AS prev_price 
      ON company.TICKER = prev_price.ticker
    WHERE price.date_time >= DATEADD(day, -1, CAST(GETDATE() AS date))
      AND price.date_time < CAST(GETDATE() AS date)
    GROUP BY company.LV2    
    `),
        );
      
      //Caching data for the next request
      await this.redis.set(RedisKeys.MarketBreadth, result);
      return result;
    } catch (error) {
      throw new CatchException(error);
    }
  }
}
