import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {Cache} from 'cache-manager';
import {DataSource} from 'typeorm';
import {CatchException} from '../exceptions/common.exception';
import {MarketVolatilityResponse} from '../responses/MarketVolatiliy.response';
import {GetExchangeQuery} from "./dto/getExchangeQuery.dto";
import {NetTransactionValueResponse} from "../responses/NetTransactionValue.response";
import {MarketBreadthRawInterface} from "../interfaces/market-breadth.interface";
import {MarketBreadthRespone} from "../responses/MarketBreadth.response";
import {RedisKeys} from "../enums/redis-keys.enum";
import {BooleanEnum} from "../enums/common.enum";
import * as moment from "moment";

@Injectable()
export class StockService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
    ) {
    }

    //Biến động thị trường
    async getMarketVolatility(): Promise<any> {
        try {
            const redisData = await this.redis.get(RedisKeys.MarketVolatility);
            if (redisData) return redisData;

            const {latestDate, previousDate, weekDate, monthDate, yearDate} =
                await this.getSessionDate('[PHANTICH].[dbo].[database_chisotoday]');

            const query = `
                SELECT ticker, close_price FROM [PHANTICH].[dbo].[database_chisotoday]
                WHERE date_time = @0 ORDER BY yyyymmdd DESC
            `;

            const dataToday = await this.db.query(query, [latestDate]);
            const dataYesterday = await this.db.query(query, [previousDate]);
            const dataLastWeek = await this.db.query(query, [weekDate]);
            const dataLastMonth = await this.db.query(query, [monthDate]);
            const dataLastYear = await this.db.query(query, [yearDate]);

            console.log({dataToday})
            console.log({dataLastYear})

            const result = new MarketVolatilityResponse().mapToList(dataToday.map((item) => {
                const previousData = dataYesterday.find(i => i.ticker === item.ticker);
                const weekData = dataLastWeek.find(i => i.ticker === item.ticker);
                const monthData = dataLastMonth.find(i => i.ticker === item.ticker);
                const yearData = dataLastYear.find(i => i.ticker === item.ticker);

                return {
                    ticker: item.ticker,
                    day_change_percent: ((item.close_price - previousData.close_price) / previousData.close_price) * 100,
                    week_change_percent: ((item.close_price - weekData.close_price) / weekData.close_price) * 100,
                    month_change_percent: ((item.close_price - monthData.close_price) / monthData.close_price) * 100,
                    year_change_percent: ((item.close_price - yearData.close_price) / yearData.close_price) * 100,
                }
            }))
            await this.redis.set(RedisKeys.MarketVolatility, result, 30)
            return result;
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
            const {latestDate, previousDate, weekDate, monthDate} =
                await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

            const query = `
                SELECT company.LV2 AS industry, p.ticker, p.close_price, p.ref_price, p.high, p.low, p.date_time
                FROM [PHANTICH].[dbo].[ICBID] company JOIN [PHANTICH].[dbo].[database_mkt] p
                ON company.TICKER = p.ticker WHERE p.date_time = @0
            `;
            const marketCapQuery: string = `
                SELECT c.LV2 AS industry, p.yyyymmdd as date, SUM(p.mkt_cap) AS total_market_cap
                FROM [PHANTICH].[dbo].[database_mkt] p JOIN [PHANTICH].[dbo].[ICBID] c
                ON p.ticker = c.TICKER 
                WHERE p.yyyymmdd = @0 
                OR p.yyyymmdd = @1
                OR p.yyyymmdd = @2
                OR p.yyyymmdd = @3
                GROUP BY c.LV2, p.yyyymmdd
                ORDER BY p.yyyymmdd DESC
            `;

            //Sum total_market_cap by industry (ICBID.LV2)
            const marketCap: MarketBreadthRawInterface[]
                = await this.db.query(marketCapQuery, [latestDate, previousDate, weekDate, monthDate]);

            //Group by industry
            const groupByIndustry = marketCap.reduce((result, item) => {
                (result[item.industry] || (result[item.industry] = [])).push(item);
                return result;
            }, {});

            //Calculate change percent per day, week, month
            const industryChanges = Object.entries(groupByIndustry).map(([industry, values]: any) => {
                return {
                    industry,
                    day_change_percent: ((values[0].total_market_cap - values[1].total_market_cap) / values[1].total_market_cap) * 100,
                    week_change_percent: ((values[0].total_market_cap - values[2].total_market_cap) / values[2].total_market_cap) * 100,
                    month_change_percent: ((values[0].total_market_cap - values[3].total_market_cap) / values[3].total_market_cap) * 100,
                };
            });

            //Get data of the 1st day and the 2nd day
            const dataToday: MarketBreadthRawInterface[] = await this.db.query(query, [latestDate]);
            const dataYesterday: MarketBreadthRawInterface[] = await this.db.query(query, [previousDate]);

            //Count how many stock change (increase, decrease, equal, ....) by industry(ICBID.LV2)
            const result: any = [];
            for await (const item of dataToday) {
                const yesterdayItem = dataYesterday.find(i => i.ticker == item.ticker);

                const change = item.close_price - yesterdayItem.ref_price;
                const isIncrease = item.close_price > yesterdayItem.ref_price && item.close_price < yesterdayItem.ref_price * 1.07;
                const isDecrease = item.close_price < yesterdayItem.ref_price && item.close_price > yesterdayItem.ref_price * 0.93;
                const isHigh = item.close_price >= yesterdayItem.ref_price * 1.07 && item.close_price != yesterdayItem.ref_price;
                const isLow = item.close_price <= yesterdayItem.ref_price * 0.93 && item.close_price != yesterdayItem.ref_price;

                result.push({
                    industry: item.industry,
                    equal: change === 0 ? BooleanEnum.True : BooleanEnum.False,
                    increase: isIncrease && !isHigh ? BooleanEnum.True : BooleanEnum.False,
                    decrease: isDecrease && !isLow ? BooleanEnum.True : BooleanEnum.False,
                    high: isHigh ? BooleanEnum.True : BooleanEnum.False,
                    low: isLow ? BooleanEnum.True : BooleanEnum.False,
                });
            }
            const final = result.reduce((stats, record) => {
                const existingStats = stats.find((s) => s.industry === record.industry);
                const industryChange = industryChanges.find(i => i.industry == record.industry);

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
                        ...industryChange
                    });
                }
                ;
                return stats;
            }, []);

            //Map response
            const mappedData = new MarketBreadthRespone().mapToList(final);

            //Caching data for the next request
            await this.redis.set(RedisKeys.MarketBreadth, mappedData, 30);
            return mappedData
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Giao dịch ròng
    async getNetTransactionValue(q: GetExchangeQuery) {
        try {
            const {exchange} = q;
            const parameters = [
                moment().format('YYYY-MM-DD'),
                moment().subtract(3, 'month').format('YYYY-MM-DD'),
                exchange.toUpperCase()
            ];
            const query = `
                SELECT e.date_time AS date, e.close_price AS exchange_price, e.ticker AS exchange,
                    SUM(n.net_value_td) AS net_proprietary,
                    SUM(n.net_value_canhan) AS net_retail,
                    SUM(n.net_value_foreign) AS net_foreign
                FROM PHANTICH.dbo.database_chisotoday e
                JOIN PHANTICH.dbo.BCN_netvalue n ON e.date_time = n.date_time
                WHERE e.ticker = @2 
                AND e.date_time <= @0 
                AND e.date_time >= @1
                GROUP BY e.date_time, e.close_price, e.ticker
                ORDER BY date DESC
            `;
            const result = new NetTransactionValueResponse().mapToList(await this.db.query(query, parameters));
            return result;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Get the nearest day have transaction in session, week, month...
    private async getSessionDate(table: string) {
        const lastWeek = moment().subtract('1', 'week').format('YYYY-MM-DD');
        const lastMonth = moment().subtract('1', 'month').format('YYYY-MM-DD');
        const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');

        const latestDates = await this.db.query(`
            SELECT DISTINCT TOP 2 yyyymmdd FROM ${table}
            WHERE yyyymmdd IS NOT NULL ORDER BY yyyymmdd DESC 
        `, [table]);

        let query = `
            SELECT TOP 1 yyyymmdd FROM ${table} 
            WHERE yyyymmdd IS NOT NULL
            ORDER BY ABS(DATEDIFF(day, yyyymmdd, @0))`
        return {
            latestDate: latestDates[0].yyyymmdd,
            previousDate: latestDates[1].yyyymmdd,
            weekDate: (await this.db.query(query, [lastWeek]))[0].yyyymmdd,
            monthDate: (await this.db.query(query, [lastMonth]))[0].yyyymmdd,
            yearDate: (await this.db.query(query, [lastYear]))[0].yyyymmdd,
        }
    }
}
