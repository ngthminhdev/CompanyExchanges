import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { ChildProcess, fork } from 'child_process';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { TimeToLive, TransactionTimeTypeEnum } from '../enums/common.enum';
import { MarketMapEnum, SelectorTypeEnum } from '../enums/exchange.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import {
  CatchException,
  ExceptionResponse,
} from '../exceptions/common.exception';
import { LineChartInterface } from '../kafka/interfaces/line-chart.interface';
import { UtilCommonTemplate } from '../utils/utils.common';
import { GetExchangeQuery } from './dto/getExchangeQuery.dto';
import { GetLiquidityQueryDto } from './dto/getLiquidityQuery.dto';
import { GetMarketMapQueryDto } from './dto/getMarketMapQuery.dto';
import { MarketLiquidityQueryDto } from './dto/marketLiquidityQuery.dto';
import { MerchandisePriceQueryDto } from './dto/merchandisePriceQuery.dto';
import { NetForeignQueryDto } from './dto/netForeignQuery.dto';
import {
  ExchangeValueInterface,
  TickerByExchangeInterface,
} from './interfaces/exchange-value.interface';
import { IndustryFullInterface } from './interfaces/industry-full.interface';
import { InternationalIndexInterface } from './interfaces/international-index.interface';
import { MarketVolatilityRawInterface } from './interfaces/market-volatility.interface';
import { MerchandisePriceInterface } from './interfaces/merchandise-price.interface';
import { NetForeignInterface } from './interfaces/net-foreign.interface';
import { RsiInterface, TransactionGroup } from './interfaces/rsi.interface';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import { StockEventsInterface } from './interfaces/stock-events.interface';
import { TopNetForeignByExInterface } from './interfaces/top-net-foreign-by-ex.interface';
import { TopNetForeignInterface } from './interfaces/top-net-foreign.interface';
import { TopRocInterface } from './interfaces/top-roc-interface';
import { DomesticIndexResponse } from './responses/DomesticIndex.response';
import { IndustryResponse } from './responses/Industry.response';
import { InternationalIndexResponse } from './responses/InternationalIndex.response';
import { InternationalSubResponse } from './responses/InternationalSub.response';
import { LiquidContributeResponse } from './responses/LiquidityContribute.response';
import { MarketEvaluationResponse } from './responses/MarketEvaluation.response';
import { MarketLiquidityResponse } from './responses/MarketLiquidity.response';
import { MarketVolatilityResponse } from './responses/MarketVolatiliy.response';
import { MerchandisePriceResponse } from './responses/MerchandisePrice.response';
import { NetForeignResponse } from './responses/NetForeign.response';
import { NetTransactionValueResponse } from './responses/NetTransactionValue.response';
import { RsiResponse } from './responses/Rsi.response';
import { StockEventsResponse } from './responses/StockEvents.response';
import { StockNewsResponse } from './responses/StockNews.response';
import { TopNetForeignResponse } from './responses/TopNetForeign.response';
import { TopNetForeignByExResponse } from './responses/TopNetForeignByEx.response';
import { TopRocResponse } from './responses/TopRoc.response';
import { UpDownTickerResponse } from './responses/UpDownTicker.response';
import { MarketMapResponse } from './responses/market-map.response';

@Injectable()
export class StockService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
  ) {}

  public async getExchangesVolume(
    startDate: Date | string,
    endDate: Date | string = startDate,
  ): Promise<any> {
    try {
      let exchange: any = await this.redis.get(
        `${RedisKeys.ExchangeVolume}:${startDate}:${endDate}`,
      );
      if (exchange) return exchange;

      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        'PHANTICH.dbo.database_mkt',
      );
      //Calculate exchange volume

      if (!exchange) {
        exchange = (
          await this.db.query(
            `
                    SELECT c.EXCHANGE AS exchange, SUM(t.total_value_mil) as value
                    FROM PHANTICH.dbo.database_mkt t
                    JOIN PHANTICH.dbo.ICBID c ON c.TICKER = t.ticker
                    WHERE date_time >= @0 and date_time <= @1
                    GROUP BY exchange
                `,
            [startDate || latestDate, endDate || latestDate],
          )
        ).reduce((prev, curr) => {
          return { ...prev, [curr.exchange]: curr.value };
        }, {});
        await this.redis.set(
          `${RedisKeys.ExchangeVolume}:${startDate}:${endDate}`,
          {
            ...exchange,
            ALL: exchange?.['HSX'] + exchange?.['HNX'] + exchange?.['UPCOM'],
          },
        );
        return {
          ...exchange,
          ALL: exchange?.['HSX'] + exchange?.['HNX'] + exchange?.['UPCOM'],
        };
      }
    } catch (e) {
      throw new CatchException(e);
    }
  }

  public async getTickerPrice() {
    try {
      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        'PHANTICH.dbo.database_mkt',
      );
      //Calculate exchange volume
      let tickerPrice: any = await this.redis.get(RedisKeys.TickerPrice);
      if (tickerPrice) return tickerPrice;

      if (!tickerPrice) {
        tickerPrice = (
          await this.db.query(
            `
                        SELECT ticker, close_price as price
                        FROM PHANTICH.dbo.database_mkt t
                        WHERE date_time = @0
                    `,
            [latestDate],
          )
        ).reduce((prev, curr) => {
          return { ...prev, [curr.ticker]: curr.price };
        }, {});
        await this.redis.set(RedisKeys.TickerPrice, tickerPrice);
        return tickerPrice;
      }
    } catch (e) {}
  }

  //Get the nearest day have transaction in session, week, month...
  public async getSessionDate(
    table: string,
    column: string = 'date_time',
    instance: any = this.db,
  ): Promise<SessionDatesInterface> {
    let dateColumn = column;
    if (column.startsWith('[')) {
      dateColumn = column.slice(1, column.length - 1);
    }

    const lastWeek = moment().subtract('1', 'week').format('YYYY-MM-DD');
    const lastMonth = moment().subtract('1', 'month').format('YYYY-MM-DD');
    const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
    const firstDateYear = moment().startOf('year').format('YYYY-MM-DD');

    const dates = await instance.query(`
            SELECT DISTINCT TOP 2 ${column} FROM ${table}
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
      weekDate:
        (await instance.query(query, [lastWeek]))[0]?.[dateColumn] ||
        new Date(),
      monthDate:
        (await instance.query(query, [lastMonth]))[0]?.[dateColumn] ||
        new Date(),
      yearDate:
        (await instance.query(query, [lastYear]))[0]?.[dateColumn] ||
        new Date(),
      firstDateYear:
        (await instance.query(query, [firstDateYear]))[0]?.[dateColumn] ||
        new Date(),
    };
  }

  //Biến động thị trường
  async getMarketVolatility(): Promise<MarketVolatilityResponse[]> {
    try {
      const redisData: MarketVolatilityResponse[] = await this.redis.get(
        RedisKeys.MarketVolatility,
      );
      if (redisData) return redisData;

      const sessionDates: SessionDatesInterface = await this.getSessionDate(
        '[PHANTICH].[dbo].[database_chisotoday]',
      );

      const query: string = `
                SELECT ticker, close_price FROM [PHANTICH].[dbo].[database_chisotoday]
                WHERE date_time = @0 ORDER BY ticker DESC
            `;

      let dataToday: MarketVolatilityRawInterface[],
        dataYesterday: MarketVolatilityRawInterface[],
        dataLastWeek: MarketVolatilityRawInterface[],
        dataLastMonth: MarketVolatilityRawInterface[],
        dataLastYear: MarketVolatilityRawInterface[];

      [dataToday, dataYesterday, dataLastWeek, dataLastMonth, dataLastYear] =
        await Promise.all(
          Object.values(sessionDates).map((date: Date) => {
            return this.db.query(query, [date]);
          }),
        );

      const result: MarketVolatilityResponse[] =
        new MarketVolatilityResponse().mapToList(
          dataToday.map((item) => {
            const previousData = dataYesterday.find(
              (i) => i.ticker === item.ticker,
            );
            const weekData = dataLastWeek.find((i) => i.ticker === item.ticker);
            const monthData = dataLastMonth.find(
              (i) => i.ticker === item.ticker,
            );
            const yearData = dataLastYear.find((i) => i.ticker === item.ticker);

            return {
              ticker: item.ticker,
              day_change_percent:
                ((item.close_price - previousData.close_price) /
                  previousData.close_price) *
                100,
              week_change_percent:
                ((item.close_price - weekData.close_price) /
                  weekData.close_price) *
                100,
              month_change_percent:
                ((item.close_price - monthData.close_price) /
                  monthData.close_price) *
                100,
              year_change_percent:
                ((item.close_price - yearData.close_price) /
                  yearData.close_price) *
                100,
            };
          }),
        );
      // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
      await this.redis.set(
        RedisKeys.MarketVolatility,
        result,
        TimeToLive.Minute,
      );
      return result;
    } catch (error) {
      throw new CatchException(error);
    }
  }

  //Thanh khoản
  async getMarketLiquidity(
    q: MarketLiquidityQueryDto,
  ): Promise<MarketLiquidityResponse[]> {
    try {
      const { order } = q;
      //Check caching data is existed
      const redisData: MarketLiquidityResponse[] = await this.redis.get(
        `${RedisKeys.MarketLiquidity}:${order}`,
      );
      if (redisData) return redisData;
      // Get 2 latest date
      const { latestDate, previousDate }: SessionDatesInterface =
        await this.getSessionDate('[PHANTICH].[dbo].[database_mkt]');

      //Calculate exchange volume
      let exchange: ExchangeValueInterface[] = await this.getExchangesVolume(
        latestDate,
      );

      const query: string = `
                SELECT t.total_value_mil AS value, t.ticker, c.LV2 AS industry, c.EXCHANGE AS exchange,
                ((t.total_value_mil - t2.total_value_mil) / NULLIF(t2.total_value_mil, 0)) * 100 AS value_change_percent
                FROM PHANTICH.dbo.database_mkt t
                JOIN PHANTICH.dbo.database_mkt t2 ON t.ticker = t2.ticker AND t2.date_time = @1
                JOIN PHANTICH.dbo.ICBID c ON c.TICKER = t.ticker
                WHERE t.date_time = @0
            `;

      const data: TickerByExchangeInterface[] = await this.db.query(query, [
        latestDate,
        previousDate,
      ]);
      const mappedData = new MarketLiquidityResponse().mapToList(
        data.map((item) => {
          return {
            ticker: item.ticker,
            industry: item.industry,
            value: item.value,
            value_change_percent: item.value_change_percent,
            contribute: (item.value / exchange[item.exchange]) * 100,
          };
        }),
      );
      let sortedData: MarketLiquidityResponse[];
      switch (+order) {
        case 0:
          sortedData = [...mappedData].sort(
            (a, b) => b.value_change_percent - a.value_change_percent,
          );
          break;
        case 1:
          sortedData = [...mappedData].sort(
            (a, b) => a.value_change_percent - b.value_change_percent,
          );
          break;
        case 2:
          sortedData = [...mappedData].sort(
            (a, b) => b.contribute - a.contribute,
          );
          break;
        case 3:
          sortedData = [...mappedData].sort(
            (a, b) => a.contribute - b.contribute,
          );
          break;
        default:
          sortedData = mappedData;
      }

      // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
      await this.redis.set(
        `${RedisKeys.MarketLiquidity}:${order}`,
        sortedData,
        TimeToLive.Minute,
      );
      return sortedData;
    } catch (error) {
      throw new CatchException(error);
    }
  }

  //Phân ngành
  async getIndustry(exchange: string): Promise<any> {
    try {
      //Check caching data is existed
      const redisData: IndustryResponse[] = await this.redis.get(
        `${RedisKeys.Industry}:${exchange}`,
      );
      if (redisData) return redisData;

      //Get 2 latest date
      const {
        latestDate,
        previousDate,
        weekDate,
        monthDate,
        firstDateYear,
      }: SessionDatesInterface = await this.getSessionDate(
        '[PHANTICH].[dbo].[database_mkt]',
      );

      const byExchange: string =
        exchange == 'ALL' ? ' ' : ` AND c.EXCHANGE = '${exchange}' `;
      const groupBy: string = exchange == 'ALL' ? ' ' : ', c.EXCHANGE ';

      const query = (date): string => `
                SELECT c.LV2 AS industry, p.ticker, p.close_price, p.ref_price, p.high, p.low, p.date_time
                FROM [WEBSITE_SERVER].[dbo].[ICBID] c JOIN [PHANTICH].[dbo].[database_mkt] p
                ON c.TICKER = p.ticker WHERE p.date_time = '${date}' ${byExchange} AND c.LV2 != '#N/A' AND c.LV2 NOT LIKE 'C__________________'
            `;

      const marketCapQuery: string = `
                SELECT c.LV2 AS industry, p.date_time, SUM(p.mkt_cap) AS total_market_cap
                ${groupBy} FROM [PHANTICH].[dbo].[database_mkt] p JOIN [WEBSITE_SERVER].[dbo].[ICBID] c
                ON p.ticker = c.TICKER 
                WHERE p.date_time IN 
                    ('${UtilCommonTemplate.toDate(latestDate)}', 
                    '${UtilCommonTemplate.toDate(previousDate)}', 
                    '${UtilCommonTemplate.toDate(weekDate)}', 
                    '${UtilCommonTemplate.toDate(monthDate)}', 
                    '${UtilCommonTemplate.toDate(
                      firstDateYear,
                    )}' ) ${byExchange}
                AND c.LV2 != '#N/A' AND c.LV2 NOT LIKE 'C__________________'
                GROUP BY c.LV2 ${groupBy}, p.date_time
                ORDER BY p.date_time DESC
            `;

      const industryChild: ChildProcess = fork(
        __dirname + '/processes/industry-child.js',
      );
      industryChild.send({ marketCapQuery });
      const industryChanges = (await new Promise((resolve, reject): void => {
        industryChild.on('message', (industryChanges): void => {
          resolve(industryChanges);
        });
        industryChild.on('exit', (code, e): void => {
          if (code !== 0) reject(e);
        });
      })) as any;

      const industryDataChild: ChildProcess = fork(
        __dirname + '/processes/industry-data-child.js',
      );

      industryDataChild.send({
        query1: query(UtilCommonTemplate.toDate(latestDate)),
        query2: query(UtilCommonTemplate.toDate(previousDate)),
      });

      const result = (await new Promise((resolve, reject): void => {
        industryDataChild.on('message', (result: any): void => {
          resolve(result);
        });
        industryDataChild.on('exit', (code, e): void => {
          if (code !== 0) reject(e);
        });
      })) as any;

      //Count how many stock change (increase, decrease, equal, ....) by industry(ICBID.LV2)
      const final = result.reduce((stats, record) => {
        const existingStats = stats.find(
          (s) => s?.industry === record?.industry,
        );
        const industryChange = industryChanges.find(
          (i) => i?.industry == record?.industry,
        );
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
            ...industryChange,
          });
        }
        return stats;
      }, []);

      const marketVolatility: any = final.reduce(
        (prev, curr) => {
          return {
            equal: prev.equal + curr.equal,
            high: prev.high + curr.high,
            low: prev.low + curr.low,
            increase: prev.increase + curr.increase,
            decrease: prev.decrease + curr.decrease,
          };
        },
        {
          equal: 0,
          high: 0,
          low: 0,
          increase: 0,
          decrease: 0,
        },
      );

      await this.redis.set(RedisKeys.IndustryFull, marketVolatility);

      const buySellPressure: ChildProcess = fork(
        __dirname + '/processes/buy-sell-pressure-child.js',
      );
      buySellPressure.send({ exchange });

      const buySellData = (await new Promise((resolve, reject): void => {
        buySellPressure.on('message', (buySellData: any): void => {
          resolve(buySellData);
        });
        buySellPressure.on('exit', (code, e): void => {
          if (code !== 0) reject(e);
        });
      })) as any;

      //Map response
      const mappedData: IndustryResponse[] = [
        ...new IndustryResponse().mapToList(final),
      ].sort((a, b) => (a.industry > b.industry ? 1 : -1));

      //Caching data for the next request
      await this.redis.store.set(`${RedisKeys.Industry}:${exchange}`, {
        data: mappedData,
        buySellData: buySellData?.[0],
      });
      return { data: mappedData, buySellData: buySellData?.[0] };
    } catch (error) {
      throw new CatchException(error);
    }
  }

  //Giao dịch ròng
  async getNetTransactionValue(
    q: GetExchangeQuery,
  ): Promise<NetTransactionValueResponse[]> {
    try {
      const { exchange } = q;
      const parameters: string[] = [
        moment().format('YYYY-MM-DD'),
        moment().subtract(3, 'month').format('YYYY-MM-DD'),
        exchange.toUpperCase(),
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
      return new NetTransactionValueResponse().mapToList(
        await this.db.query(query, parameters),
      );
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Tin tức thị trường
  async getNews(): Promise<StockNewsResponse[]> {
    try {
      const redisData: StockNewsResponse[] = await this.redis.get(
        RedisKeys.StockNews,
      );
      if (redisData) return redisData;
      const query = `
                SELECT TOP 80 * FROM [DULIEUVIMOVIETNAM].[dbo].[TinTuc]
                ORDER BY Date DESC
            `;
      const data = new StockNewsResponse().mapToList(
        await this.db.query(query),
      );
      await this.redis.set(RedisKeys.StockNews, data);
      return data;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Tin tức vĩ mô thế giới
  async getMacroNews(): Promise<StockNewsResponse[]> {
    try {
      const redisData: StockNewsResponse[] = await this.redis.get(
        RedisKeys.StockMacroNews,
      );
      if (redisData) return redisData;
      const query = `
                SELECT TOP 80 * FROM [DULIEUVIMOTHEGIOI].[dbo].[TinTucViMo]
                ORDER BY Date DESC
            `;
      const data = new StockNewsResponse().mapToList(
        await this.db.query(query),
      );
      await this.redis.set(RedisKeys.StockMacroNews, data);
      return data;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Chỉ số trong nước
  async getDomesticIndex(): Promise<DomesticIndexResponse[]> {
    try {
      // const redisData: DomesticIndexResponse[] = await this.redis.get(RedisKeys.DomesticIndex);
      // if (redisData) return redisData

      // If data is not available in Redis, retrieve the latest and previous dates for the index data
      // using a custom method getSessionDate() that queries a SQL database

      // Construct a SQL query that selects the ticker symbol, date time, close price, change in price,
      // and percent change for all ticker symbols with data for the latest date and the previous date
      const query: string = `
                SELECT *
                FROM [WEBSITE_SERVER].[dbo].[index_table]
            `;
      // Execute the SQL query using a database object and pass the latest and previous dates as parameters
      const dataToday: LineChartInterface[] = await this.db.query(query);

      // Map the retrieved data to a list of DomesticIndexResponse objects using the mapToList() method of the DomesticIndexResponse class
      const mappedData: DomesticIndexResponse[] =
        new DomesticIndexResponse().mapToList(dataToday);

      // Cache the mapped data in Redis for faster retrieval in the future, using the same key as used earlier
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Top giá trị ròng khối ngoại
  async getTopNetForeign(exchange): Promise<TopNetForeignResponse[]> {
    try {
      // const redisData: TopNetForeignResponse[] = await this.redis.get(
      //   RedisKeys.TopNetForeign,
      // );
      // if (redisData) return redisData;

      const { latestDate } = await this.getSessionDate(
        '[marketTrade].[dbo].[foreign]',
        'date',
        this.dbServer,
      );

      // Define a function query() that takes an argument order and returns a
      // SQL query string that selects the top 10 tickers
      // with the highest or lowest net value foreign for the latest date, depending on the order argument
      const query = (order: string): string => `
                SELECT TOP 10 f.code as ticker, f.netVal as net_value_foreign
                FROM [marketTrade].[dbo].[foreign] f
                JOIN [marketInfor].[dbo].[info] i
                on f.code = i.code
                WHERE f.date = @0 and i.floor = @1 and i.[type] = 'STOCK'
                ORDER BY netVal ${order}
            `;
      // Execute two SQL queries using the database object to retrieve the top 10 tickers
      // with the highest and lowest net value foreign
      // for the latest date, and pass the latest date as a parameter
      const [dataTop, dataBot]: [
        TopNetForeignInterface[],
        TopNetForeignInterface[],
      ] = await Promise.all([
        this.dbServer.query(query('DESC'), [latestDate, exchange]),
        this.dbServer.query(query('ASC'), [latestDate, exchange]),
      ]);

      // Concatenate the results of the two queries into a single array, and reverse the order of the bottom 10 tickers
      // so that they are listed in ascending order of net value foreign
      const mappedData = new TopNetForeignResponse().mapToList([
        ...dataTop,
        ...[...dataBot].reverse(),
      ]);
      // await this.redis.set(RedisKeys.TopNetForeign, mappedData);

      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Khối ngoại mua bán ròng
  async getNetForeign(q: NetForeignQueryDto): Promise<NetForeignResponse[]> {
    try {
      const { exchange, transaction } = q;
      // const redisData: NetForeignResponse[] = await this.redis.get(
      //   `${RedisKeys.NetForeign}:${exchange}:${transaction}`,
      // );
      // if (redisData) return redisData;

      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        '[marketTrade].[dbo].[foreign]',
        'date',
        this.dbServer,
      );

      const query = (transaction: number): string => `
        SELECT c.floor as EXCHANGE, c.LV2, c.code as ticker, n.netVal AS total_value_${
          +transaction ? 'sell' : 'buy'
        }
        FROM [marketTrade].[dbo].[foreign] n
        JOIN [marketInfor].[dbo].[info] c
        ON c.code = n.code AND c.floor = @1
        WHERE date = @0 and n.netVal ${
          +transaction ? ' < 0 ' : ' > 0 '
        } and c.[type] = 'STOCK'
        ORDER BY netVal ${+transaction ? 'ASC' : 'DESC'}
    `;

      const data: NetForeignInterface[] = await this.dbServer.query(
        query(transaction),
        [latestDate, exchange],
      );
      const mappedData = new NetForeignResponse().mapToList(data);
      // await this.redis.set(
      //   `${RedisKeys.NetForeign}:${exchange}:${transaction}`,
      //   mappedData,
      // );
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Top thay đổi giữa 5 phiên theo sàn
  async getTopROC(q: GetExchangeQuery): Promise<TopRocResponse[]> {
    try {
      const { exchange } = q;
      let ex =
        exchange.toUpperCase() === 'UPCOM' ? 'UPCoM' : exchange.toUpperCase();
      ex = exchange.toUpperCase() === 'HSX' ? 'HOSE' : exchange.toUpperCase();

      const redisData: TopRocResponse[] = await this.redis.get(
        `${RedisKeys.TopRoc5}:${ex}`,
      );
      if (redisData) return redisData;

      const { latestDate, weekDate }: SessionDatesInterface =
        await this.getSessionDate(`[COPHIEUANHHUONG].[dbo].[${ex}]`, 'date');

      const query = (order: string): string => `
                SELECT TOP 10 t1.ticker, ((t1.gia - t2.gia) / t2.gia) * 100 AS ROC_5
                FROM [COPHIEUANHHUONG].[dbo].[${ex}] t1
                JOIN [COPHIEUANHHUONG].[dbo].[${ex}] t2
                ON t1.ticker = t2.ticker AND t2.date = @1
                WHERE t1.date = @0
                ORDER BY ROC_5 ${order}
            `;

      const [dataTop, dataBot]: [TopRocInterface[], TopRocInterface[]] =
        await Promise.all([
          this.db.query(query('DESC'), [latestDate, weekDate]),
          this.db.query(query('ASC'), [latestDate, weekDate]),
        ]);

      const mappedData: TopRocResponse[] = new TopRocResponse().mapToList([
        ...dataTop,
        ...[...dataBot].reverse(),
      ]);
      await this.redis.set(`${RedisKeys.TopRoc5}:${ex}`, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Top mua bán ròng khối ngoại thay đổi giữa 5 phiên theo sàn
  async getTopNetForeignChangeByExchange(
    q: GetExchangeQuery,
  ): Promise<TopNetForeignByExResponse[]> {
    try {
      const { exchange } = q;
      const redisData: TopNetForeignByExResponse[] = await this.redis.get(
        `${RedisKeys.TopNetForeignByEx}:${exchange.toUpperCase()}`,
      );
      if (redisData) return redisData;

      const { latestDate, weekDate }: SessionDatesInterface =
        await this.getSessionDate(`[PHANTICH].[dbo].[BCN_netvalue]`);

      const query = (order: string): string => `
                SELECT TOP 10 t1.ticker, c.EXCHANGE AS exchange, 
                    SUM(t1.net_value_foreign) AS net_value
                FROM [PHANTICH].[dbo].[BCN_netvalue] t1
                JOIN [WEBSITE_SERVER].[dbo].[ICBID] c
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
        new TopNetForeignByExResponse().mapToList([
          ...dataTop,
          ...[...dataBot].reverse(),
        ]);

      await this.redis.set(
        `${RedisKeys.TopNetForeignByEx}:${exchange.toUpperCase()}`,
        mappedData,
      );
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Chỉ số quốc tế
  async getMaterialPrice(): Promise<InternationalIndexResponse[]> {
    try {
      const redisData: InternationalIndexResponse[] = await this.redis.get(
        RedisKeys.InternationalIndex,
      );
      if (redisData) return redisData;

      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        '[PHANTICH].[dbo].[data_chisoquocte]',
      );
      const date2: SessionDatesInterface = await this.getSessionDate(
        `[DULIEUVIMOTHEGIOI].[dbo].[HangHoa]`,
        'lastUpdated',
      );

      const data3 = await this.db.query(`
        select top 3 ticker, close_price as diemso, p_change as percent_d
        from [PHANTICH].[dbo].[database_mkt]
        order by date_time desc, p_change desc
      `);

      const query: string = `
                SELECT name AS ticker,lastUpdated AS date_time, price AS diemso, unit, 
                change1D AS percent_d,
                change5D AS percent_w,
                change1M AS percent_m, changeYTD AS percent_ytd
                FROM [DULIEUVIMOTHEGIOI].[dbo].[HangHoa]
                WHERE lastUpdated >= @0 and (name like '%WTI%' OR name like 'USD/VND' OR name like 'Vàng')
            `;
      const data2 = new InternationalSubResponse().mapToList(
        await this.db.query(query, [date2.latestDate]),
      );

      const data: InternationalIndexInterface[] = await this.db.query(
        `
                SELECT * FROM [PHANTICH].[dbo].[data_chisoquocte]
                WHERE date_time = @0
            `,
        [latestDate],
      );

      const mappedData: InternationalIndexResponse[] =
        new InternationalIndexResponse().mapToList([
          ...data,
          ...data2,
          ...data3,
        ]);
      await this.redis.set(RedisKeys.InternationalIndex, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
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
            `);

      const mappedData: StockEventsResponse[] =
        new StockEventsResponse().mapToList(data);
      await this.redis.set(RedisKeys.StockEvents, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Giá hàng hóa
  async getMerchandisePrice(
    q: MerchandisePriceQueryDto,
  ): Promise<MerchandisePriceResponse[]> {
    try {
      const { type } = q;

      const redisData: MerchandisePriceResponse[] = await this.redis.get(
        `${RedisKeys.MerchandisePrice}:${type}`,
      );
      if (redisData) return redisData;

      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        `[DULIEUVIMOTHEGIOI].[dbo].[HangHoa]`,
        'lastUpdated',
      );

      const query: string = `
                SELECT name, price, unit, change1D AS Day,
                changeMTD AS MTD, changeYTD AS YTD
                FROM [DULIEUVIMOTHEGIOI].[dbo].[HangHoa]
                WHERE lastUpdated = @0 and unit ${+type ? '=' : '!='} ''
            `;

      const data: MerchandisePriceInterface[] = await this.db.query(query, [
        latestDate,
      ]);
      const mappedData: MerchandisePriceResponse[] =
        new MerchandisePriceResponse().mapToList(data);
      await this.redis.set(`${RedisKeys.MerchandisePrice}:${type}`, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getRSI(session: number = 20): Promise<Record<string, RsiResponse>> {
    try {
      const redisData: Awaited<Record<string, RsiResponse>> =
        await this.redis.get(`${RedisKeys.Rsi}:${session}`);
      if (redisData) return redisData;

      const query = (count: number): string => `
                select sum(total_value_mil) AS transaction_value, 
                LV2 AS industry, date_time from [PHANTICH].[dbo].[database_mkt] t1
                join [WEBSITE_SERVER].[dbo].[ICBID] t2 on t1.ticker = t2.TICKER
                where date_time
                in (select distinct top ${count} date_time from 
                    [PHANTICH].[dbo].[database_mkt] order by date_time desc)
                    AND t2.LV2 != '#N/A' 
                group by LV2, date_time
                order by LV2, date_time;
            `;

      const data: RsiInterface[] = await this.db.query(query(session));
      console.log(data);

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

      const mappedData: Record<any, RsiResponse> = {};
      for (const item in cashByIndustry) {
        const { cashGain, cashLost } = cashByIndustry[item];
        const rsCash: number = cashGain / cashLost || 0;
        mappedData[item] = {
          cashGain,
          cashLost,
          rsCash,
          rsiCash: 100 - 100 / (1 + rsCash),
        };
      }
      await this.redis.set(`${RedisKeys.Rsi}:${session}`, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Đánh giá thị trường
  async marketEvaluation(): Promise<MarketEvaluationResponse[]> {
    try {
      const redisData: MarketEvaluationResponse[] = await this.redis.get(
        RedisKeys.MarketEvaluation,
      );
      if (redisData) return redisData;

      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        '[PHANTICH].[dbo].[biendong-chiso-mainweb]',
        '[Date Time]',
      );

      // const query: string = `
      //     select * from [PHANTICH].[dbo].[biendong-chiso-mainweb]
      //     where [Date Time] = @0
      //     order by [Date Time] desc
      // `;
      // const data = await this.db.query(query, [latestDate]);

      const mappedData = new MarketEvaluationResponse().mapToList(
        await this.db.query(`
                 select top 6 *, [Date Time] as date from [PHANTICH].[dbo].[biendong-chiso-mainweb]
                 order by [Date Time] desc
            `),
      );
      await this.redis.set(RedisKeys.MarketEvaluation, mappedData);
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  // Đóng góp thanh khoản
  async getLiquidityContribute(q: GetLiquidityQueryDto) {
    try {
      const { order, type, exchange } = q;
      const redisData = await this.redis.get(
        `${RedisKeys.LiquidityContribute}:${type}:${order}:${exchange}`,
      );
      if (redisData) return redisData;

      let group: string = ` `;
      let select: string = ` t.Ticker as symbol, `;
      let select2: string = `
                        sum(m.total_value_mil) as totalValueMil,
                        sum(m.total_vol) as totalVolume,
                        sum(t.Gia_tri_mua) - sum(t.Gia_tri_ban) as supplyDemandValueGap,
                        sum(t.Chenh_lech_cung_cau) as supplyDemandVolumeGap `;
      let ex: string =
        exchange.toUpperCase() == 'ALL'
          ? ' '
          : ` and c.EXCHANGE = '${exchange.toUpperCase()}'`;
      switch (parseInt(type)) {
        case SelectorTypeEnum.LV1:
          select = ' c.LV1 as symbol, ';
          group = ` and c.LV1 != '#N/A' group by c.LV1 `;
          break;
        case SelectorTypeEnum.LV2:
          select = ' c.LV2 as symbol, ';
          group = ` and c.LV2 != '#N/A' group by c.LV2 `;
          break;
        case SelectorTypeEnum.LV3:
          select = ' c.LV3 as symbol, ';
          group = ` and c.LV3 != '#N/A' group by c.LV3 `;
          break;
        default:
          select2 = ` 
                       m.total_value_mil as totalValueMil,
                       m.total_vol as totalVolume,
                       t.Gia_tri_mua - t.Gia_tri_ban as supplyDemandValueGap,
                       t.Chenh_lech_cung_cau as supplyDemandVolumeGap `;
      }
      const { latestDate, weekDate, monthDate, firstDateYear } =
        await this.getSessionDate(
          `[PHANTICH].[dbo].[TICKER_AC_CC]`,
          '[DateTime]',
        );

      let startDate: Date | string;

      switch (+order) {
        case TransactionTimeTypeEnum.Latest:
          startDate = UtilCommonTemplate.toDate(latestDate);
          break;
        case TransactionTimeTypeEnum.OneWeek:
          startDate = UtilCommonTemplate.toDate(weekDate);
          break;
        case TransactionTimeTypeEnum.OneMonth:
          startDate = UtilCommonTemplate.toDate(monthDate);
          break;
        default:
          startDate = UtilCommonTemplate.toDate(firstDateYear);
          break;
      }

      const query: string = `
                select top 30 ${select} ${select2} from PHANTICH.dbo.TICKER_AC_CC t
                join PHANTICH.dbo.ICBID c on t.Ticker = c.TICKER 
                join PHANTICH.dbo.database_mkt m on c.TICKER = m.ticker
                and t.[DateTime] = m.date_time 
                where t.[DateTime] >= @0 and t.[DateTime] <= @1  ${ex} ${group} 
                order by totalValueMil desc
            `;

      const data = await this.db.query(query, [
        startDate,
        UtilCommonTemplate.toDate(latestDate),
      ]);
      const exchangesVolume: any = await this.getExchangesVolume(
        startDate,
        UtilCommonTemplate.toDate(latestDate),
      );
      const mappedData = new LiquidContributeResponse().mapToList(
        data,
        exchangesVolume[exchange.toUpperCase()],
      );
      await this.redis.set(
        `${RedisKeys.LiquidityContribute}:${type}:${order}:${exchange}`,
        mappedData,
      );
      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  //Bản đồ toàn thị trường
  async getMarketMap(q: GetMarketMapQueryDto) {
    try {
      const { exchange, order } = q;
      const ex = exchange.toUpperCase();
      const byExchange = ex === 'ALL' ? ' ' : ' AND c.floor = @1 ';
      // const redisData = await this.redis.get<MarketMapResponse[]>(
      //   `${RedisKeys.MarketMap}:${exchange}:${order}`,
      // );
      // if (redisData) return redisData;

      let { latestDate }: SessionDatesInterface = await this.getSessionDate(
        '[marketTrade].[dbo].[tickerTradeVND]',
        'date',
        this.dbServer,
      );
      let date = latestDate;
      if (+order === MarketMapEnum.Foreign) {
        date = (
          await this.getSessionDate(
            '[marketTrade].[dbo].[foreign]',
            'date',
            this.dbServer,
          )
        ).latestDate;
        const query: string = `
                SELECT c.floor AS global, c.LV2 AS industry, 
                c.code as ticker, n.netVal AS value
                FROM [marketTrade].[dbo].[foreign] n
                JOIN [marketInfor].[dbo].[info] c
                ON c.code = n.code ${byExchange}
                WHERE n.date = @0 and c.[type] = 'STOCK'
                AND c.LV2 != ''
            `;
        const mappedData = new MarketMapResponse().mapToList(
          await this.dbServer.query(query, [date, ex]),
        );

        await this.redis.set(
          `${RedisKeys.MarketMap}:${exchange}:${order}`,
          mappedData,
        );

        return mappedData;
      }

      let field: string;
      switch (parseInt(order)) {
        case MarketMapEnum.MarketCap:
          field = 'marketCap';
          break;
        case MarketMapEnum.Value:
          field = 'totalVal';
          break;
        default:
          field = 'totalVol';
      }

      const query: string = `
                SELECT c.floor AS global, c.LV2 AS industry, 
                c.code as ticker, n.${field} AS value 
                FROM [marketTrade].[dbo].[tickerTradeVND] n
                JOIN [marketInfor].[dbo].[info] c
                ON c.code = n.code ${byExchange}
                WHERE n.date = @0 and c.[type] = 'STOCK'
                AND c.LV2 != ''   
            `;

      const mappedData = new MarketMapResponse().mapToList(
        await this.dbServer.query(query, [date, ex]),
      );

      await this.redis.set(
        `${RedisKeys.MarketMap}:${exchange}:${order}`,
        mappedData,
      );

      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }

  async getUpDownTicker(index: string): Promise<IndustryFullInterface> {
    try {
      const redisData = await this.redis.get<IndustryFullInterface>(
        `${RedisKeys.BienDongThiTruong}:${index}`,
      );
      if (redisData) return redisData;

      const { latestDate, previousDate } = await this.getSessionDate(
        '[marketTrade].[dbo].[tickerTradeVND]',
        'date',
        this.dbServer,
      );
      let high!: string;
      let low!: string;
      let indexCode!: string;

      switch (index) {
        case 'VNINDEX':
          high = '1.065';
          low = '0.935';
          indexCode = " and i.floor = 'HOSE'";
          break;
        case 'VN30':
          high = '1.065';
          low = '0.935';
          indexCode = " and i.floor = 'HOSE' and i.[indexCode] = 'VN30'";
          break;
        case 'VNXALL':
          high = '1.065';
          low = '0.935';
          indexCode = " and i.floor = 'HOSE' or i.floor = 'HNX'";
          break;
        case 'HNXINDEX':
          high = '1.062';
          low = '0.938';
          indexCode = " and i.floor = 'HNX'";
          break;
        case 'HNX30':
          high = '1.062';
          low = '0.938';
          indexCode = " and i.floor = 'HNX' and i.[indexCode] = 'HNX30'";
          break;
        case 'UPINDEX':
          high = '1.12';
          low = '0.88';
          indexCode = " and i.floor = 'UPCOM'";
          break;
        default:
          throw new ExceptionResponse(
            HttpStatus.BAD_REQUEST,
            'Index not found',
          );
          break;
      }

      const query: string = `
      select
        sum(case when now.closePrice = prev.closePrice then 1 else 0 end) as [equal],
        sum(case when now.closePrice >= prev.closePrice * ${high} then 1 else 0 end) as [high],
        sum(case when now.closePrice <= prev.closePrice * ${low} then 1 else 0 end) as [low],
        sum(case when now.closePrice > prev.closePrice and now.closePrice < prev.closePrice * ${high}  then 1 else 0 end) as [increase],
        sum(case when now.closePrice < prev.closePrice and now.closePrice > prev.closePrice * ${low} then 1 else 0 end) as [decrease]
      from (
          select code, closePrice from [marketTrade].[dbo].[tickerTradeVND] where [date] = @0
      ) now right join (
          select code, closePrice from [marketTrade].[dbo].[tickerTradeVND] where [date] = @1
      ) prev on now.code = prev.code
      join [marketInfor].[dbo].[info] i on i.code = now.code
      where now.closePrice is not null and prev.closePrice is not null and i.[type] = 'STOCK' ${indexCode};
      `;

      console.log({ query, latestDate, previousDate });

      const data: IndustryFullInterface = await this.dbServer.query(query, [
        latestDate,
        previousDate,
      ]);

      const mappedData = new UpDownTickerResponse(data![0]);

      await this.redis.set(
        `${RedisKeys.BienDongThiTruong}:${index}`,
        mappedData,
      );

      return mappedData;
    } catch (e) {
      throw new CatchException(e);
    }
  }
}
