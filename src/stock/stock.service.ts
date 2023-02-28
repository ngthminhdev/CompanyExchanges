import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {Cache} from 'cache-manager';
import {DataSource} from 'typeorm';
import {CatchException} from '../exceptions/common.exception';
import {MarketVolatilityInterface} from '../interfaces/market-volatility.interfaces';
import {MarketVolatilityResponse} from '../responses/MarketVolatiliy.response';
import {GetPageLimitStockDto} from "./dto/getPageLimitStock.dto";
import {NetTransactionValueResponse} from "../responses/NetTransactionValue.response";
import {MarketBreadthInterface} from "../interfaces/market-breadth.interface";
import {MarketBreadthRespone} from "../responses/MarketBreadth.response";
import {RedisKeys} from "../enums/redis-keys.enum";

@Injectable()
export class StockService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
    ) {
    }

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

            //Get 2 latest date
            const selectedDate = await this.db.query(
                `SELECT DISTINCT TOP 2 yyyymmdd FROM PHANTICH.dbo.database_mkt ORDER BY yyyymmdd DESC
            `);


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
              WHERE date_time = @1
            ) AS prev_price
              ON company.TICKER = prev_price.ticker
            WHERE price.date_time = @0
            GROUP BY company.LV2
            `, [selectedDate[0].yyyymmdd, selectedDate[1].yyyymmdd]));

            //Caching data for the next request
            await this.redis.set(RedisKeys.MarketBreadth, result);
            return result;
        } catch (error) {
            throw new CatchException(error);
        }
    }

    async getNetTransactionValue(q: GetPageLimitStockDto) {
        try {
            const {page = 0, limit = 20, exchange} = q;
            const parameters = [+page == 1 ? 0 : page * +limit, +limit, exchange.toUpperCase()];

            const total_record: number = (await this.db.query(`SELECT COUNT(*) OVER () AS total_record 
                FROM PHANTICH.dbo.BCN_netvalue GROUP BY date_time`))[0].total_record;

            const query = `
                SELECT e.date_time AS date, e.close_price AS exchange_price, e.ticker AS exchange,
                    SUM(n.net_value_td) AS total_proprietary,
                    SUM(n.net_value_canhan) AS total_retail,
                    SUM(n.net_value_foreign) AS total_foreign
                FROM PHANTICH.dbo.database_chisotoday e
                JOIN PHANTICH.dbo.BCN_netvalue n ON e.date_time = n.date_time
                WHERE e.ticker = @2
                GROUP BY e.date_time, e.close_price, e.ticker
                ORDER BY date DESC
                OFFSET @0 ROWS
                FETCH NEXT @1 ROWS ONLY
            `;
            const result = new NetTransactionValueResponse().mapToList(await this.db.query(query, parameters))


            return {
                per_page: +limit,
                total_page: Math.round(total_record / limit),
                total_records: total_record,
                data: result,
            };
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
