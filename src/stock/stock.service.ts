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
import {BooleanEnum, TimeToLive} from "../enums/common.enum";
import * as moment from "moment";
import {SessionDatesInterface} from "../interfaces/session-dates.interface";
import {ExchangeValueInterface, TickerByExchangeInterface} from "../interfaces/exchange-value.interface";
import {MarketLiquidityResponse} from "../responses/MarketLiquidity.response";
import {MarketVolatilityRawInterface} from "../interfaces/market-volatility.interface";
import {MarketLiquidityQueryDto} from "./dto/marketLiquidityQuery.dto";

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
            const redisData: MarketVolatilityResponse[] = await this.redis.get(RedisKeys.MarketVolatility);
            if (redisData) return redisData;

            const sessionDates: SessionDatesInterface =
                await this.getSessionDate('[PHANTICH].[dbo].[database_chisotoday]');

            const query: string = `
                SELECT ticker, close_price FROM [PHANTICH].[dbo].[database_chisotoday]
                WHERE date_time = @0 ORDER BY date_time DESC
            `;

            let dataToday: MarketVolatilityRawInterface[],
                dataYesterday: MarketVolatilityRawInterface[],
                dataLastWeek: MarketVolatilityRawInterface[],
                dataLastMonth: MarketVolatilityRawInterface[],
                dataLastYear: MarketVolatilityRawInterface[];

            [dataToday, dataYesterday, dataLastWeek, dataLastMonth, dataLastYear] = await Promise.all(Object.values(sessionDates).map((date: Date) => {
                return this.db.query(query, [date])
            }));

            const result: MarketVolatilityResponse[] = new MarketVolatilityResponse().mapToList(dataToday.map((item) => {
                const previousData = dataYesterday.find((i) => i.ticker === item.ticker);
                const weekData = dataLastWeek.find((i) => i.ticker === item.ticker);
                const monthData = dataLastMonth.find((i) => i.ticker === item.ticker);
                const yearData = dataLastYear.find((i) => i.ticker === item.ticker);

                return {
                    ticker: item.ticker,
                    day_change_percent: ((item.close_price - previousData.close_price) / previousData.close_price) * 100,
                    week_change_percent: ((item.close_price - weekData.close_price) / weekData.close_price) * 100,
                    month_change_percent: ((item.close_price - monthData.close_price) / monthData.close_price) * 100,
                    year_change_percent: ((item.close_price - yearData.close_price) / yearData.close_price) * 100,
                }
            }))
            await this.redis.set(RedisKeys.MarketVolatility, result, TimeToLive.Minute)
            return result;
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Thanh khoản
    async getMarketLiquidity(q: MarketLiquidityQueryDto): Promise<MarketLiquidityResponse[]> {
        try {
            const { order } = q;
            //Check caching data is existed
            const redisData: MarketLiquidityResponse[] = await this.redis.get(`${RedisKeys.MarketLiquidity}:${order}`);
            if (redisData) return redisData;
            // Get 2 latest date
            const {latestDate, previousDate}: SessionDatesInterface =
                await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

            //Calculate exchange volume
            let exchange: ExchangeValueInterface[] = await this.redis.get(RedisKeys.ExchangeVolume);
            if (!exchange) {
                exchange = (await this.db.query(`
                    SELECT c.EXCHANGE AS exchange, SUM(t.total_value_mil) as value
                    FROM PHANTICH.dbo.database_mkt t
                    JOIN PHANTICH.dbo.ICBID c ON c.TICKER = t.ticker
                    WHERE date_time = @0
                    GROUP BY exchange
                `, [latestDate])).reduce((prev, curr) => {
                    return {...prev, [curr.exchange]: curr.value}
                }, {});
                await this.redis.set(RedisKeys.ExchangeVolume, exchange, TimeToLive.Minute);
            }

            const query: string = `
                SELECT t.total_value_mil AS value, t.ticker, c.LV2 AS industry, c.EXCHANGE AS exchange,
                ((t.total_value_mil - t2.total_value_mil) / NULLIF(t2.total_value_mil, 0)) * 100 AS value_change_percent
                FROM PHANTICH.dbo.database_mkt t
                JOIN PHANTICH.dbo.database_mkt t2 ON t.ticker = t2.ticker AND t2.date_time = @1
                JOIN PHANTICH.dbo.ICBID c ON c.TICKER = t.ticker
                WHERE t.date_time = @0
            `;

            const data: TickerByExchangeInterface[] = await this.db.query(query, [latestDate, previousDate]);
            const mappedData = new MarketLiquidityResponse().mapToList(data.map((item) => {
                return {
                    ticker: item.ticker,
                    industry: item.industry,
                    value: item.value,
                    value_change_percent: item.value_change_percent,
                    contribute: (item.value / exchange[item.exchange]) * 100
                }
            }));
            let sortedData: MarketLiquidityResponse[];
            switch (+order) {
                case 0:
                    sortedData = [...mappedData].sort((a,b) => b.value_change_percent - a.value_change_percent);
                    break;
                case 1:
                    sortedData = [...mappedData].sort((a,b) => a.value_change_percent - b.value_change_percent);
                    break;
                case 2:
                    sortedData = [...mappedData].sort((a,b) => b.contribute - a.contribute);
                    break;
                case 3:
                    sortedData = [...mappedData].sort((a,b) => a.contribute - b.contribute);
                    break;
                default:
                    sortedData = mappedData;
            }

            //Caching data for the next request
            await this.redis.set(`${RedisKeys.MarketLiquidity}:${order}`, sortedData, TimeToLive.Minute);
            return sortedData
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Độ rộng ngành
    async getMarketBreadth(): Promise<MarketBreadthRespone[]> {
        try {
            //Check caching data is existed
            const redisData: MarketBreadthRespone[] = await this.redis.get(RedisKeys.MarketBreadth);
            if (redisData) return redisData;

            //Get 2 latest date
            const {latestDate, previousDate, weekDate, monthDate}: SessionDatesInterface =
                await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

            const query: string = `
                SELECT company.LV2 AS industry, p.ticker, p.close_price, p.ref_price, p.high, p.low, p.date_time
                FROM [PHANTICH].[dbo].[ICBID] company JOIN [PHANTICH].[dbo].[database_mkt] p
                ON company.TICKER = p.ticker WHERE p.date_time = @0
            `;

            const marketCapQuery: string = `
                SELECT c.LV2 AS industry, p.date_time, SUM(p.mkt_cap) AS total_market_cap
                FROM [PHANTICH].[dbo].[database_mkt] p JOIN [PHANTICH].[dbo].[ICBID] c
                ON p.ticker = c.TICKER 
                WHERE p.date_time IN (@0, @1, @2, @3)
                GROUP BY c.LV2, p.date_time
                ORDER BY p.date_time DESC
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
            const [dataToday, dataYesterday]: [MarketBreadthRawInterface[], MarketBreadthRawInterface[]] =
                await Promise.all([this.db.query(query, [latestDate]), this.db.query(query, [previousDate])])

            //Count how many stock change (increase, decrease, equal, ....) by industry(ICBID.LV2)
            const result = dataToday.map((item) => {
                const yesterdayItem = dataYesterday.find(i => i.ticker === item.ticker);
                if (!yesterdayItem) return;
                return {
                    industry: item.industry,
                    equal: this.isEqual(yesterdayItem, item),
                    increase: this.isIncrease(yesterdayItem, item),
                    decrease: this.isDecrease(yesterdayItem, item),
                    high: this.isHigh(yesterdayItem, item),
                    low: this.isLow(yesterdayItem, item),
                };
            });


            const final = result.reduce((stats, record) => {
                const existingStats = stats.find((s) => s?.industry === record?.industry);
                const industryChange = industryChanges.find((i) => i?.industry == record?.industry);
                if (!industryChange) return stats;

                if (existingStats) {
                    existingStats.equal += record.equal;
                    existingStats.increase += record.increase;
                    existingStats.decrease += record.decrease;
                    existingStats.high += record.high;
                    existingStats.low += record.low;
                } else {
                    stats.push({
                        industry: record.industry,
                        equal: record.equal,
                        increase: record.increase,
                        decrease: record.decrease,
                        high: record.high,
                        low: record.low,
                        ...industryChange
                    });
                }
                return stats;
            }, []);

            //Map response
            const mappedData: MarketBreadthRespone[] = new MarketBreadthRespone().mapToList(final);

            //Caching data for the next request
            await this.redis.store.set(RedisKeys.MarketBreadth, mappedData, TimeToLive.Minute);
            return mappedData
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Giao dịch ròng
    async getNetTransactionValue(q: GetExchangeQuery): Promise<NetTransactionValueResponse[]> {
        try {
            const {exchange} = q;
            const parameters: string[] = [
                moment().format('YYYY-MM-DD'),
                moment().subtract(3, 'month').format('YYYY-MM-DD'),
                exchange.toUpperCase()
            ];
            const query: string = `
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
            return new NetTransactionValueResponse().mapToList(await this.db.query(query, parameters));
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Get the nearest day have transaction in session, week, month...
    private async getSessionDate(table: string): Promise<SessionDatesInterface> {
        const lastWeek = moment().subtract('1', 'week').format('YYYY-MM-DD');
        const lastMonth = moment().subtract('1', 'month').format('YYYY-MM-DD');
        const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');

        const dates = await this.db.query(`
            SELECT DISTINCT TOP 2 date_time FROM ${table}
            WHERE date_time IS NOT NULL ORDER BY date_time DESC 
        `, [table]);

        const query: string = `
            SELECT TOP 1 date_time FROM ${table}
            WHERE date_time IS NOT NULL
            ORDER BY ABS(DATEDIFF(day, date_time, @0))`
        return {
            latestDate: dates[0].date_time,
            previousDate: dates[1].date_time,
            weekDate: (await this.db.query(query, [lastWeek]))[0].date_time,
            monthDate: (await this.db.query(query, [lastMonth]))[0].date_time,
            yearDate: (await this.db.query(query, [lastYear]))[0].date_time,
        }
    }

    private isEqual = (yesterdayItem: MarketBreadthRawInterface, item: MarketBreadthRawInterface): BooleanEnum => {
        const change = item.close_price - yesterdayItem.ref_price;
        return change === 0 ? BooleanEnum.True : BooleanEnum.False
    };

    private isIncrease = (yesterdayItem: MarketBreadthRawInterface, item: MarketBreadthRawInterface): BooleanEnum => {
        return item.close_price > yesterdayItem.ref_price && item.close_price < yesterdayItem.ref_price * 1.07
            ? BooleanEnum.True : BooleanEnum.False;
    };

    private isDecrease = (yesterdayItem: MarketBreadthRawInterface, item: MarketBreadthRawInterface): BooleanEnum => {
        return item.close_price < yesterdayItem.ref_price && item.close_price > yesterdayItem.ref_price * 0.93
            ? BooleanEnum.True : BooleanEnum.False;
    };

    private isHigh = (yesterdayItem: MarketBreadthRawInterface, item: MarketBreadthRawInterface): BooleanEnum => {
        return item.close_price >= yesterdayItem.ref_price * 1.07 && item.close_price !== yesterdayItem.ref_price
            ? BooleanEnum.True : BooleanEnum.False;
    };

    private isLow = (yesterdayItem: MarketBreadthRawInterface, item: MarketBreadthRawInterface): BooleanEnum => {
        return item.close_price <= yesterdayItem.ref_price * 0.93 && item.close_price !== yesterdayItem.ref_price
            ? BooleanEnum.True : BooleanEnum.False;
    };
}
