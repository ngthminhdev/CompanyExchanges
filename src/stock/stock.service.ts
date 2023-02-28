import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {Cache} from 'cache-manager';
import {DataSource} from 'typeorm';
import {CatchException} from '../exceptions/common.exception';
import {MarketVolatilityInterface} from '../interfaces/market-volatility.interfaces';
import {MarketVolatilityResponse} from '../responses/MarketVolatiliy.response';
import {GetPageLimitStockDto} from "./dto/getPageLimitStock.dto";
import {NetTransactionValueResponse} from "../responses/NetTransactionValue.response";
import {MarketBreadthRawInterface} from "../interfaces/market-breadth.interface";
import {MarketBreadthRespone} from "../responses/MarketBreadth.response";
import {RedisKeys} from "../enums/redis-keys.enum";
import {BooleanEnum} from "../enums/common.enum";
import {UtilCommonTemplate} from "../utils/utils.common";

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
    async getMarketBreadth(): Promise<MarketBreadthRespone[]> {
        try {
            //Check caching data is existed
            const redisData: any = await this.redis.get(RedisKeys.MarketBreadth);
            if (redisData) return redisData;

            //Get 2 latest date
            const selectedDate = await this.db.query(
                `SELECT DISTINCT TOP 2 yyyymmdd FROM PHANTICH.dbo.database_mkt ORDER BY yyyymmdd DESC
            `);

            const query = `
                SELECT company.LV2 AS industry, p.ticker, p.close_price, p.ref_price, p.high, p.low, p.date_time
                FROM [PHANTICH].[dbo].[ICBID] company JOIN [PHANTICH].[dbo].[database_mkt] p
                ON company.TICKER = p.ticker WHERE p.date_time = @0
            `;
            const marketCapQuery = (type: string, amount: number): string => `
                SELECT c.LV2 AS industry, SUM(p.mkt_cap) AS total_market_cap
                FROM [PHANTICH].[dbo].[database_mkt] p JOIN [PHANTICH].[dbo].[ICBID] c
                ON p.ticker = c.TICKER WHERE p.date_time = DATEADD(${type}, ${amount}, @0) GROUP BY c.LV2
            `;

            //Sum total_market_cap by industry (ICBID.LV2)
            const marketCapToday: MarketBreadthRawInterface[] = await this.db.query(marketCapQuery('day', 0),[UtilCommonTemplate.toDate(selectedDate[0].yyyymmdd)]);
            const marketCapYesterday: MarketBreadthRawInterface[] = await this.db.query(marketCapQuery('day', 0),[UtilCommonTemplate.toDate(selectedDate[1].yyyymmdd)]);
            const marketLastWeek: MarketBreadthRawInterface[] = await this.db.query(marketCapQuery('week', -1),[UtilCommonTemplate.toDate(selectedDate[0].yyyymmdd)]);
            const marketLastMonth: MarketBreadthRawInterface[] = await this.db.query(marketCapQuery('month', -1),[UtilCommonTemplate.toDate(selectedDate[0].yyyymmdd)]);

            //Calculate % change total_market_cap
            const dayChange = this.getChangePercent(marketCapToday, marketCapYesterday);
            const weekChange = this.getChangePercent(marketCapToday, marketLastWeek);
            const monthChange = this.getChangePercent(marketCapToday, marketLastMonth);

            //Get data of the 1st day and the 2nd day
            const dataToday: MarketBreadthRawInterface[] = await this.db.query(query, [selectedDate[0].yyyymmdd]);
            const dataYesterday: MarketBreadthRawInterface[] = await this.db.query(query, [selectedDate[1].yyyymmdd]);

            //Count how many stock change (increase, decrease, equal, ....) by industry(ICBID.LV2)
            const result: any = [];
            for await (const item of dataToday) {
                const yesterdayItem = dataYesterday.find(i => i.ticker = item.ticker);

                const change = item.ref_price - yesterdayItem.ref_price;
                const isIncrease = item.close_price > yesterdayItem.ref_price;
                const isDecrease = item.close_price < yesterdayItem.ref_price;
                const isHigh = item.close_price >= yesterdayItem.high;
                const isLow = item.close_price <= yesterdayItem.low;

                result.push({
                    industry: item.industry,
                    equal: change === BooleanEnum.False ? BooleanEnum.True : BooleanEnum.False,
                    increase: isIncrease && !isHigh ? BooleanEnum.True : BooleanEnum.False,
                    decrease: isDecrease && !isLow ? BooleanEnum.True : BooleanEnum.False,
                    high: isHigh ? BooleanEnum.True : BooleanEnum.False,
                    low: isLow ? BooleanEnum.True : BooleanEnum.False,
                });
            }
            const final = result.reduce((stats, record) => {
                const existingStats = stats.find((s) => s.industry === record.industry);
                if (existingStats) {
                    existingStats.equal += record.equal;
                    existingStats.increase += record.increase;
                    existingStats.decrease += record.decrease;
                    existingStats.high += record.high;
                    existingStats.low += record.low;
                } else {
                    stats.push({
                        industry: record.industry,
                        market_cap: record.market_cap,
                        equal: record.equal,
                        increase: record.increase,
                        decrease: record.decrease,
                        high: record.high,
                        low: record.low,
                        day_change_percent: (dayChange.find(i => i.industry == record.industry)).change,
                        week_change_percent: (weekChange.find(i => i.industry == record.industry)).change,
                        month_change_percent: (monthChange.find(i => i.industry == record.industry)).change,
                    });
                };
                return stats;
            }, []);

            //Map response
            const mappedData = new MarketBreadthRespone().mapToList(final);

            //Caching data for the next request
            await this.redis.set(RedisKeys.MarketBreadth, final, 10);
            return mappedData;
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

    private getChangePercent(arr1: any[], arr2: any[]) {
        return arr1.map(item => {
            const matching = arr2.find(i => i.industry == item.industry);
            return {
                industry: item.industry,
                change: ((item.total_market_cap - matching.total_market_cap) / matching.total_market_cap) * 100,
            }
        })
    }
}
