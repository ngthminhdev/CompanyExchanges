import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource} from '@nestjs/typeorm';
import {Cache} from 'cache-manager';
import {DataSource} from 'typeorm';
import {CatchException} from '../exceptions/common.exception';
import {MarketVolatilityResponse} from './responses/MarketVolatiliy.response';
import {GetExchangeQuery} from "./dto/getExchangeQuery.dto";
import {NetTransactionValueResponse} from "./responses/NetTransactionValue.response";
import {IndustryResponse} from "./responses/Industry.response";
import {RedisKeys} from "../enums/redis-keys.enum";
import {TimeToLive} from "../enums/common.enum";
import * as moment from "moment";
import {SessionDatesInterface} from "./interfaces/session-dates.interface";
import {ExchangeValueInterface, TickerByExchangeInterface} from "./interfaces/exchange-value.interface";
import {MarketLiquidityResponse} from "./responses/MarketLiquidity.response";
import {MarketVolatilityRawInterface} from "./interfaces/market-volatility.interface";
import {MarketLiquidityQueryDto} from "./dto/marketLiquidityQuery.dto";
import {StockNewsResponse} from "./responses/StockNews.response";
import {DomesticIndexInterface} from "./interfaces/domestic-index.interface";
import {DomesticIndexResponse} from "./responses/DomesticIndex.response";
import {TopNetForeignInterface} from "./interfaces/top-net-foreign.interface";
import {TopNetForeignResponse} from "./responses/TopNetForeign.response";
import {NetForeignResponse} from "./responses/NetForeign.response";
import {NetForeignQueryDto} from "./dto/netForeignQuery.dto";
import {TopRocInterface} from "./interfaces/top-roc-interface";
import {TopRocResponse} from "./responses/TopRoc.response";
import {TopNetForeignByExInterface} from "./interfaces/top-net-foreign-by-ex.interface";
import {TopNetForeignByExResponse} from "./responses/TopNetForeignByEx.response";
import {InternationalIndexInterface} from "./interfaces/international-index.interface";
import {InternationalIndexResponse} from "./responses/InternationalIndex.response";
import {StockEventsInterface} from "./interfaces/stock-events.interface";
import {StockEventsResponse} from "./responses/StockEvents.response";
import {NetForeignInterface} from "./interfaces/net-foreign.interface";
import {MerchandisePriceQueryDto} from "./dto/merchandisePriceQuery.dto";
import {MerchandisePriceInterface} from "./interfaces/merchandise-price.interface";
import {MerchandisePriceResponse} from "./responses/MerchandisePrice.response";
import {InternationalSubResponse} from "./responses/InternationalSub.response";
import {RsiInterface, TransactionGroup} from "./interfaces/rsi.interface";
import {RsiResponse} from "./responses/Rsi.response";
import {MarketEvaluationResponse} from "./responses/MarketEvaluation.response";
import {GetMarketMapQueryDto} from "./dto/getMarketMapQuery.dto";
import {MarketMapResponse} from "./responses/market-map.response";
import {SelectorTypeEnum, MarketMapEnum} from "../enums/exchange.enum";
import {ChildProcess, fork} from "child_process";
import {UtilCommonTemplate} from "../utils/utils.common";
import {LiquidContributeResponse} from "./responses/LiquidityContribute.response";
import {GetLiquidityQueryDto} from "./dto/getLiquidityQuery.dto";

@Injectable()
export class StockService {
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        @InjectDataSource() private readonly db: DataSource,
    ) {
    }

    public async getExchangesVolume(): Promise<any> {
        try {
            const {latestDate}: SessionDatesInterface = await this.getSessionDate('PHANTICH.dbo.database_mkt')
            //Calculate exchange volume
            let exchange: any = await this.redis.get(RedisKeys.ExchangeVolume);
            if (exchange) return exchange;

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
                await this.redis.set(RedisKeys.ExchangeVolume, {...exchange, ALL: exchange?.["HSX"] + exchange?.["HNX"] + exchange?.["UPCOM"]});
                return {...exchange, ALL: exchange?.["HSX"] + exchange?.["HNX"] + exchange?.["UPCOM"]};
            }
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Get the nearest day have transaction in session, week, month...
    public async getSessionDate(table: string, column: string = 'date_time'): Promise<SessionDatesInterface> {
        const lastWeek = moment().subtract('1', 'week').format('YYYY-MM-DD');
        const lastMonth = moment().subtract('1', 'month').format('YYYY-MM-DD');
        const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
        const firstDateYear = moment().startOf("year").format('YYYY-MM-DD');

        const dates = await this.db.query(`
            SELECT DISTINCT TOP 2 ${column} FROM ${table}
            WHERE ${column} IS NOT NULL ORDER BY ${column} DESC 
        `);


        const query: string = `
            SELECT TOP 1 ${column} FROM ${table}
            WHERE ${column} IS NOT NULL
            ORDER BY ABS(DATEDIFF(day, ${column}, @0))
            `;

        return {
            latestDate: dates[0]?.[column] || new Date(),
            previousDate: dates[1]?.[column] || new Date(),
            weekDate: (await this.db.query(query, [lastWeek]))[0]?.[column] || new Date(),
            monthDate: (await this.db.query(query, [lastMonth]))[0]?.[column] || new Date(),
            yearDate: (await this.db.query(query, [lastYear]))[0]?.[column] || new Date(),
            firstDateYear: (await this.db.query(query, [firstDateYear]))[0]?.[column] || new Date(),
        }
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
                WHERE date_time = @0 ORDER BY ticker DESC
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
            // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
            await this.redis.set(RedisKeys.MarketVolatility, result, TimeToLive.Minute)
            return result;
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Thanh khoản
    async getMarketLiquidity(q: MarketLiquidityQueryDto): Promise<MarketLiquidityResponse[]> {
        try {
            const {order} = q;
            //Check caching data is existed
            const redisData: MarketLiquidityResponse[] = await this.redis.get(`${RedisKeys.MarketLiquidity}:${order}`);
            if (redisData) return redisData;
            // Get 2 latest date
            const {latestDate, previousDate}: SessionDatesInterface =
                await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

            //Calculate exchange volume
            let exchange: ExchangeValueInterface[] = await this.getExchangesVolume();

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
                    sortedData = [...mappedData].sort((a, b) => b.value_change_percent - a.value_change_percent);
                    break;
                case 1:
                    sortedData = [...mappedData].sort((a, b) => a.value_change_percent - b.value_change_percent);
                    break;
                case 2:
                    sortedData = [...mappedData].sort((a, b) => b.contribute - a.contribute);
                    break;
                case 3:
                    sortedData = [...mappedData].sort((a, b) => a.contribute - b.contribute);
                    break;
                default:
                    sortedData = mappedData;
            }

            // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
            await this.redis.set(`${RedisKeys.MarketLiquidity}:${order}`, sortedData, TimeToLive.Minute);
            return sortedData
        } catch (error) {
            throw new CatchException(error);
        }
    }

    //Phân ngành
    async getIndustry(exchange: string): Promise<any> {
        try {
            //Check caching data is existed
            const redisData: IndustryResponse[] = await this.redis.get(`${RedisKeys.Industry}:${exchange}`);
            if (redisData) return redisData;

            //Get 2 latest date
            const {latestDate, previousDate, weekDate, monthDate, firstDateYear}: SessionDatesInterface =
                await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

            const byExchange: string = exchange == "ALL"  ? " " : ` AND c.EXCHANGE = '${exchange}' `;
            const groupBy: string = exchange == 'ALL' ? " " : ', c.EXCHANGE '

            const query = (date): string => `
                SELECT c.LV2 AS industry, p.ticker, p.close_price, p.ref_price, p.high, p.low, p.date_time
                FROM [PHANTICH].[dbo].[ICBID] c JOIN [PHANTICH].[dbo].[database_mkt] p
                ON c.TICKER = p.ticker WHERE p.date_time = '${date}' ${byExchange} AND c.LV2 != '#N/A' AND c.LV2 NOT LIKE 'C__________________'
            `;

            const marketCapQuery: string = `
                SELECT c.LV2 AS industry, p.date_time, SUM(p.mkt_cap) AS total_market_cap
                ${groupBy} FROM [PHANTICH].[dbo].[database_mkt] p JOIN [PHANTICH].[dbo].[ICBID] c
                ON p.ticker = c.TICKER 
                WHERE p.date_time IN 
                    ('${UtilCommonTemplate.toDate(latestDate)}', 
                    '${UtilCommonTemplate.toDate(previousDate)}', 
                    '${UtilCommonTemplate.toDate(weekDate)}', 
                    '${UtilCommonTemplate.toDate(monthDate)}', 
                    '${UtilCommonTemplate.toDate(firstDateYear)}' ) ${byExchange}
                AND c.LV2 != '#N/A' AND c.LV2 NOT LIKE 'C__________________'
                GROUP BY c.LV2 ${groupBy}, p.date_time
                ORDER BY p.date_time DESC
            `;

            const industryChild: ChildProcess = fork(__dirname + '/processes/industry-child.js' );
            industryChild.send({ marketCapQuery })
            const industryChanges = await new Promise((resolve, reject): void => {
                industryChild.on('message', (industryChanges): void => {
                    resolve(industryChanges)
                });
                industryChild.on('exit', (code, e): void=> {
                    if (code !== 0) reject(e)
                })
            }) as any;

            const industryDataChild: ChildProcess = fork(__dirname + '/processes/industry-data-child.js')

            industryDataChild.send({
                query1: query(UtilCommonTemplate.toDate(latestDate)),
                query2: query(UtilCommonTemplate.toDate(previousDate))
            })

            const result = await new Promise((resolve, reject): void => {
                industryDataChild.on('message', (result: any): void => {
                    resolve(result)
                });
                industryDataChild.on('exit', (code, e): void => {
                    if (code !== 0) reject(e)
                })
            }) as any;


            //Count how many stock change (increase, decrease, equal, ....) by industry(ICBID.LV2)
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

            const marketVolatility: any = final.reduce((prev, curr) => {
                return {
                    equal : prev.equal + curr.equal,
                    high : prev.high + curr.high,
                    low : prev.low + curr.low,
                    increase : prev.increase + curr.increase,
                    decrease : prev.decrease + curr.decrease,
                }
            }, {
                equal: 0,
                high: 0,
                low: 0,
                increase: 0,
                decrease: 0,
            })

            await this.redis.set(RedisKeys.IndustryFull, marketVolatility);

            const buySellPressure: ChildProcess = fork(__dirname + '/processes/buy-sell-pressure-child.js')
            buySellPressure.send({exchange});

            const buySellData = await new Promise((resolve, reject): void => {
                buySellPressure.on('message', (buySellData: any): void => {
                    resolve(buySellData)
                });
                buySellPressure.on('exit', (code, e): void => {
                    if (code !== 0) reject(e)
                })
            }) as any;

            //Map response
            const mappedData: IndustryResponse[] = [...new IndustryResponse().mapToList(final)]
                .sort((a, b) => a.industry > b.industry ? 1 : -1);

            //Caching data for the next request
            await this.redis.store.set(`${RedisKeys.Industry}:${exchange}`, {data: mappedData, buySellData: buySellData?.[0] });
            return {data: mappedData, buySellData: buySellData?.[0] }
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
                    SUM(n.net_value_td) AS net_retail,
                    SUM(n.net_value_canhan) AS net_proprietary,
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

    //Tin tức thị trường
    async getNews(): Promise<StockNewsResponse[]> {
        try {
            const redisData: StockNewsResponse[] = await this.redis.get(RedisKeys.StockNews);
            if (redisData) return redisData;
            const query = `
                SELECT TOP 80 * FROM [DULIEUVIMOVIETNAM].[dbo].[TinTuc]
                ORDER BY Date DESC
            `;
            const data = new StockNewsResponse().mapToList(await this.db.query(query));
            await this.redis.set(RedisKeys.StockNews, data)
            return data;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Tin tức vĩ mô thế giới
    async getMacroNews(): Promise<StockNewsResponse[]> {
        try {
            const redisData: StockNewsResponse[] = await this.redis.get(RedisKeys.StockMacroNews);
            if (redisData) return redisData;
            const query = `
                SELECT TOP 80 * FROM [DULIEUVIMOTHEGIOI].[dbo].[TinTucViMo]
                ORDER BY Date DESC
            `;
            const data = new StockNewsResponse().mapToList(await this.db.query(query));
            await this.redis.set(RedisKeys.StockMacroNews, data)
            return data;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Chỉ số trong nước
    async getDomesticIndex(): Promise<DomesticIndexResponse[]> {
        try {
            const redisData: DomesticIndexResponse[] = await this.redis.get(RedisKeys.DomesticIndex);
            if (redisData) return redisData

            // If data is not available in Redis, retrieve the latest and previous dates for the index data
            // using a custom method getSessionDate() that queries a SQL database
            const {latestDate, previousDate} = await this.getSessionDate('[PHANTICH].[dbo].[database_chisotoday]');

            // Construct a SQL query that selects the ticker symbol, date time, close price, change in price,
            // and percent change for all ticker symbols with data for the latest date and the previous date
            const query: string = `
                SELECT t1.ticker, t1.date_time, t1.close_price,
                    (t1.close_price - t2.close_price) AS change_price,
                    (((t1.close_price - t2.close_price) / t2.close_price) * 100) AS percent_d,
                    t1.net_value_foreign
                FROM [PHANTICH].[dbo].[database_chisotoday] t1
                JOIN [PHANTICH].[dbo].[database_chisotoday] t2
                ON t1.ticker = t2.ticker AND t2.date_time = @1
                WHERE t1.date_time = @0 ORDER BY t1.ticker DESC
            `;
            // Execute the SQL query using a database object and pass the latest and previous dates as parameters
            const dataToday: DomesticIndexInterface[] = await this.db.query(query, [latestDate, previousDate]);

            // Map the retrieved data to a list of DomesticIndexResponse objects using the mapToList() method of the DomesticIndexResponse class
            const mappedData: DomesticIndexResponse[] = new DomesticIndexResponse().mapToList(dataToday);

            // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
            await this.redis.set(RedisKeys.DomesticIndex, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Top giá trị ròng khối ngoại
    async getTopNetForeign(): Promise<TopNetForeignResponse[]> {
        try {
            const redisData: TopNetForeignResponse[] = await this.redis.get(RedisKeys.TopNetForeign);
            if (redisData) return redisData

            const {latestDate} = await this.getSessionDate('[PHANTICH].[dbo].[BCN_netvalue]');

            // Define a function query() that takes an argument order and returns a
            // SQL query string that selects the top 10 tickers
            // with the highest or lowest net value foreign for the latest date, depending on the order argument
            const query = (order: string): string => `
                SELECT TOP 10 ticker, net_value_foreign
                FROM [PHANTICH].[dbo].[BCN_netvalue] t1
                WHERE t1.date_time = @0
                ORDER BY net_value_foreign ${order}
            `;
            // Execute two SQL queries using the database object to retrieve the top 10 tickers
            // with the highest and lowest net value foreign
            // for the latest date, and pass the latest date as a parameter
            const [dataTop, dataBot]: [
                TopNetForeignInterface[],
                TopNetForeignInterface[],
            ] = await Promise.all([
                this.db.query(query('DESC'), [latestDate]),
                this.db.query(query('ASC'), [latestDate]),
            ]);

            // Concatenate the results of the two queries into a single array, and reverse the order of the bottom 10 tickers
            // so that they are listed in ascending order of net value foreign
            const mappedData = new TopNetForeignResponse().mapToList([...dataTop, ...[...dataBot].reverse()]);
            await this.redis.set(RedisKeys.TopNetForeign, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Khối ngoại mua bán ròng
    async getNetForeign(q: NetForeignQueryDto): Promise<NetForeignResponse[]> {
        try {
            const {exchange, transaction} = q;
            const redisData: NetForeignResponse[] = await this.redis.get(`${RedisKeys.NetForeign}:${exchange}:${transaction}`);
            if (redisData) return redisData;

            const {latestDate}: SessionDatesInterface = await this.getSessionDate('[PHANTICH].[dbo].[BCN_netvalue]');
            const query = (transaction: number): string => `
                SELECT TOP 20 c.EXCHANGE, c.LV2, c.ticker, n.net_value_foreign AS total_value_${+transaction ? 'sell' : 'buy'}
                FROM [PHANTICH].[dbo].[BCN_netvalue] n
                JOIN [PHANTICH].[dbo].[ICBID] c
                ON c.TICKER = n.ticker AND c.EXCHANGE = @1
                WHERE date_time = @0
                ORDER BY net_value_foreign ${+transaction ? 'ASC' : 'DESC'}
            `;

            const data: NetForeignInterface[] = await this.db.query(query(transaction), [latestDate, exchange]);
            const mappedData = new NetForeignResponse().mapToList(data);
            await this.redis.set(`${RedisKeys.NetForeign}:${exchange}:${transaction}`, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Top thay đổi giữa 5 phiên theo sàn
    async getTopROC(q: GetExchangeQuery): Promise<TopRocResponse[]> {
        try {
            const {exchange} = q;
            let ex = exchange.toUpperCase() === 'UPCOM' ? 'UPCoM' : exchange.toUpperCase();
            ex = exchange.toUpperCase() === 'HSX' ? 'HOSE' : exchange.toUpperCase();

            const redisData: TopRocResponse[] = await this.redis.get(`${RedisKeys.TopRoc5}:${ex}`);
            if (redisData) return redisData;

            const {latestDate, weekDate}: SessionDatesInterface
                = await this.getSessionDate(`[COPHIEUANHHUONG].[dbo].[${ex}]`, 'date');

            const query = (order: string): string => `
                SELECT TOP 10 t1.ticker, ((t1.gia - t2.gia) / t2.gia) * 100 AS ROC_5
                FROM [COPHIEUANHHUONG].[dbo].[${ex}] t1
                JOIN [COPHIEUANHHUONG].[dbo].[${ex}] t2
                ON t1.ticker = t2.ticker AND t2.date = @1
                WHERE t1.date = @0
                ORDER BY ROC_5 ${order}
            `;

            const [dataTop, dataBot]: [
                TopRocInterface[],
                TopRocInterface[],
            ] = await Promise.all([
                this.db.query(query('DESC'), [latestDate, weekDate]),
                this.db.query(query('ASC'), [latestDate, weekDate]),
            ]);

            const mappedData: TopRocResponse[] = new TopRocResponse().mapToList([...dataTop, ...[...dataBot].reverse()])
            await this.redis.set(`${RedisKeys.TopRoc5}:${ex}`, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Top mua bán ròng khối ngoại thay đổi giữa 5 phiên theo sàn
    async getTopNetForeignChangeByExchange(q: GetExchangeQuery): Promise<TopNetForeignByExResponse[]> {
        try {
            const {exchange} = q;
            const redisData: TopNetForeignByExResponse[] =
                await this.redis.get(`${RedisKeys.TopNetForeignByEx}:${exchange.toUpperCase()}`)
            if (redisData) return redisData;

            const {latestDate, weekDate}: SessionDatesInterface
                = await this.getSessionDate(`[PHANTICH].[dbo].[BCN_netvalue]`);

            const query = (order: string): string => `
                SELECT TOP 10 t1.ticker, c.EXCHANGE AS exchange, 
                    SUM(t1.net_value_foreign) AS net_value
                FROM [PHANTICH].[dbo].[BCN_netvalue] t1
                JOIN [PHANTICH].[dbo].[ICBID] c
                ON t1.ticker = c.TICKER
                WHERE c.EXCHANGE = '${exchange.toUpperCase()}'
                AND t1.date_time >= @1
                AND t1.date_time <= @0
                GROUP BY t1.ticker, exchange
                ORDER BY net_value ${order}
            `;

            const [dataTop, dataBot]: [
                TopNetForeignByExInterface[],
                TopNetForeignByExInterface[],
            ] = await Promise.all([
                this.db.query(query('DESC'), [latestDate, weekDate]),
                this.db.query(query('ASC'), [latestDate, weekDate]),
            ]);

            const mappedData: TopNetForeignByExResponse[] =
                new TopNetForeignByExResponse().mapToList([...dataTop, ...[...dataBot].reverse()]);

            await this.redis.set(`${RedisKeys.TopNetForeignByEx}:${exchange.toUpperCase()}`, mappedData);
            return mappedData

        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Chỉ số quốc tế
    async getMaterialPrice(): Promise<InternationalIndexResponse[]> {
        try {
            const redisData: InternationalIndexResponse[] = await this.redis.get(RedisKeys.InternationalIndex)
            if (redisData) return redisData;

            const {latestDate}: SessionDatesInterface
                = await this.getSessionDate('[PHANTICH].[dbo].[data_chisoquocte]');
            const date2: SessionDatesInterface = await this.getSessionDate(`[DULIEUVIMOTHEGIOI].[dbo].[HangHoa]`, 'lastUpdated')


            const query: string = `
                SELECT name AS ticker,lastUpdated AS date_time, price AS diemso, unit, 
                change1D AS percent_d,
                change5D AS percent_w,
                change1M AS percent_m, changeYTD AS percent_ytd
                FROM [DULIEUVIMOTHEGIOI].[dbo].[HangHoa]
                WHERE lastUpdated >= @0 and (name like '%WTI%' OR name like 'USD/VND' OR name like 'Vàng')
            `;
            const data2 = new InternationalSubResponse().mapToList(await this.db.query(query, [date2.latestDate]));

            const data: InternationalIndexInterface[] = await this.db.query(`
                SELECT * FROM [PHANTICH].[dbo].[data_chisoquocte]
                WHERE date_time = @0
            `, [latestDate]);

            const mappedData: InternationalIndexResponse[] = new InternationalIndexResponse().mapToList([...data, ...data2]);
            await this.redis.set(RedisKeys.InternationalIndex, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Sự kiện thị trường
    async getStockEvents() {
        try {
            const redisData = await this.redis.get(RedisKeys.StockEvents);
            if (redisData) return redisData;

            const data: StockEventsInterface[] = await this.db.query(`
                SELECT TOP 50 * FROM [PHANTICH].[dbo].[LichSuKien]
                ORDER BY NgayDKCC DESC
            `)

            const mappedData: StockEventsResponse[] = new StockEventsResponse().mapToList(data);
            await this.redis.set(RedisKeys.StockEvents, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Giá hàng hóa
    async getMerchandisePrice(q: MerchandisePriceQueryDto): Promise<MerchandisePriceResponse[]> {
        try {
            const {type} = q;

            const redisData: MerchandisePriceResponse[] = await this.redis.get(`${RedisKeys.MerchandisePrice}:${type}`);
            if (redisData) return redisData;

            const {latestDate}: SessionDatesInterface = await this.getSessionDate(`[DULIEUVIMOTHEGIOI].[dbo].[HangHoa]`, 'lastUpdated')

            const query: string = `
                SELECT name, price, unit, change1D AS Day,
                changeMTD AS MTD, changeYTD AS YTD
                FROM [DULIEUVIMOTHEGIOI].[dbo].[HangHoa]
                WHERE lastUpdated = @0 and unit ${+type ? '=' : '!=' } ''
            `;

            const data: MerchandisePriceInterface[] = await this.db.query(query, [latestDate]);
            const mappedData: MerchandisePriceResponse[] = new MerchandisePriceResponse().mapToList(data);
            await this.redis.set(`${RedisKeys.MerchandisePrice}:${type}`, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    async getRSI(session: number = 20): Promise<Record<string, RsiResponse>> {
        try {
            const redisData: Awaited<Record<string, RsiResponse>> = await this.redis.get(`${RedisKeys.Rsi}:${session}`);
            if (redisData) return redisData;

            const query = (count: number): string => `
                select sum(total_value_mil) AS transaction_value, 
                LV2 AS industry, date_time from [PHANTICH].[dbo].[database_mkt] t1
                join [PHANTICH].[dbo].[ICBID] t2 on t1.ticker = t2.TICKER
                where date_time
                in (select distinct top ${count} date_time from 
                    [PHANTICH].[dbo].[database_mkt] order by date_time desc)
                group by LV2, date_time
                order by LV2, date_time;
            `;

            const data: RsiInterface[] = await this.db.query(query(session));

            // This function calculates the relative strength index (RSI) of cash gains and losses by industry.
            // It takes in an array of transaction data and returns an object with the RSI for each industry.

            const cashByIndustry: { [key: string]: TransactionGroup } = {};
            let previousTransaction = data[0];
            for (let i = 1; i < data.length; i++) {
                const currentTransaction = data[i];
                if (currentTransaction.industry === previousTransaction.industry) {
                    const diff = currentTransaction.transaction_value - previousTransaction.transaction_value;
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

            const mappedData: Record<any, RsiResponse> = {};
            for (const item in cashByIndustry) {
                const {cashGain, cashLost} = cashByIndustry[item];
                const rsCash: number = cashGain / cashLost;
                mappedData[item] = {
                    cashGain,
                    cashLost,
                    rsCash,
                    rsiCash: 100 - 100 / (1 + rsCash)
                }
            }
            await this.redis.set(`${RedisKeys.Rsi}:${session}`, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Đánh giá thị trường
    async marketEvaluation(): Promise<MarketEvaluationResponse[]> {
        try {
            const redisData: MarketEvaluationResponse[] = await this.redis.get(RedisKeys.MarketEvaluation);
            if (redisData) return redisData;

            const {latestDate}: SessionDatesInterface = await this.getSessionDate('[PHANTICH].[dbo].[biendong-chiso-mainweb]', '[Date Time]')

            // const query: string = `
            //     select * from [PHANTICH].[dbo].[biendong-chiso-mainweb]
            //     where [Date Time] = @0
            //     order by [Date Time] desc
            // `;
            // const data = await this.db.query(query, [latestDate]);

            const mappedData = new MarketEvaluationResponse().mapToList(await this.db.query(`
                 select top 6 *, [Date Time] as date from [PHANTICH].[dbo].[biendong-chiso-mainweb]
                 order by [Date Time] desc
            `));
            await this.redis.set(RedisKeys.MarketEvaluation, mappedData);
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

    // Đóng góp thanh khoản
    async getLiquidityContribute(q: GetLiquidityQueryDto) {
        try {
            const {order, type, exchange} = q;
            const redisData = await this.redis.get(`${RedisKeys.LiquidityContribute}:${type}:${order}:${exchange}`);
            if (redisData) return redisData;

            let group: string = ` `;
            let select: string = ` t.Ticker as symbol, `;
            let select2: string = `
                        sum(m.total_value_mil) as totalValueMil,
                        sum(m.total_vol) as totalVolume,
                        sum(t.Gia_tri_mua) - sum(t.Gia_tri_ban) as supplyDemandValueGap,
                        sum(t.Chenh_lech_cung_cau) as supplyDemandVolumeGap `;
            let ex: string = exchange.toUpperCase() == 'ALL' ?  " " : `where c.EXCHANGE = '${exchange.toUpperCase()}'`;
            switch (parseInt(type)) {
                case SelectorTypeEnum.LV1:
                    select = ' c.LV1 as symbol, ';
                    group = ' group by c.LV1 '
                break;
                case SelectorTypeEnum.LV2:
                    select = ' c.LV2 as symbol, ';
                    group = ' group by c.LV2 '
                break;
                case SelectorTypeEnum.LV3:
                    select = ' c.LV3 as symbol, ';
                    group = ' group by c.LV3 '
                break;
                default:
                    select2 = ` 
                       m.total_value_mil as totalValueMil,
                       m.total_vol as totalVolume,
                       t.Gia_tri_mua - t.Gia_tri_ban as supplyDemandValueGap,
                       t.Chenh_lech_cung_cau as supplyDemandVolumeGap `
            }

            const query: string = `
                select top 30 ${select} ${select2} from PHANTICH.dbo.TICKER_AC_CC t
                join PHANTICH.dbo.ICBID c on t.Ticker = c.TICKER 
                join PHANTICH.dbo.database_mkt m on c.TICKER = m.ticker
                and t.[Date Time] = m.date_time ${ex} ${group} 
                order by totalValueMil desc
            `;

            const data = await this.db.query(query);
            const exchangesVolume: any = await this.getExchangesVolume();
            const mappedData = new LiquidContributeResponse().mapToList(data, exchangesVolume[exchange.toUpperCase()])
            await this.redis.set(`${RedisKeys.LiquidityContribute}:${type}:${order}:${exchange}`, mappedData)
            return mappedData

        } catch (e) {
            throw new CatchException(e)
        }
    }

    //Bản đồ toàn thị trường
    async getMarketMap(q: GetMarketMapQueryDto) {
        try {
            const {exchange, order} = q;
            const ex = exchange.toUpperCase();
            const byExchange = ex === 'ALL' ? " " : " AND c.EXCHANGE = @1 "
            const redisData =
                await this.redis.get<MarketMapResponse[]>(`${RedisKeys.MarketMap}:${exchange}:${order}`);
            if (redisData) return redisData;

            const {latestDate}: SessionDatesInterface = await this.getSessionDate('[PHANTICH].[dbo].[BCN_netvalue]');
            if (+order === MarketMapEnum.Foreign) {
                const query: string = `
                SELECT c.EXCHANGE AS global, c.LV2 AS industry, 
                c.ticker, n.net_value_foreign AS value
                FROM [PHANTICH].[dbo].[BCN_netvalue] n
                JOIN [PHANTICH].[dbo].[ICBID] c
                ON c.TICKER = n.ticker ${byExchange}
                WHERE date_time = @0
            `;
                const mappedData =
                    new MarketMapResponse().mapToList((await this.db.query(query,[latestDate, ex])));
                await this.redis.set(`${RedisKeys.MarketMap}:${exchange}:${order}`, mappedData);
                return mappedData;
            }

            let field: string;
            switch (parseInt(order)) {
                case MarketMapEnum.MarketCap:
                    field = 'mkt_cap'
                break;
                case MarketMapEnum.Value:
                    field = 'total_value_mil'
                break;
                default:
                    field = 'total_vol'
            }

            const query: string = `
                SELECT c.EXCHANGE AS global, c.LV2 AS industry, 
                c.ticker, n.${field} AS value 
                FROM [PHANTICH].[dbo].[database_mkt] n
                JOIN [PHANTICH].[dbo].[ICBID] c
                ON c.TICKER = n.ticker ${byExchange}
                WHERE date_time = @0
            `;

            const mappedData =
                new MarketMapResponse().mapToList((await this.db.query(query,[latestDate, ex])));
            await this.redis.set(`${RedisKeys.MarketMap}:${exchange}:${order}`, mappedData);

            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }

}
