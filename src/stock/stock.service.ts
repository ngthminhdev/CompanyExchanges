import { CACHE_MANAGER, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { ChildProcess, fork } from 'child_process';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { TimeToLive, TimeTypeEnum, TransactionTimeTypeEnum } from '../enums/common.enum';
import { MarketMapEnum, SelectorTypeEnum } from '../enums/exchange.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import {
  CatchException,
  ExceptionResponse
} from '../exceptions/common.exception';
import { LineChartInterface } from '../kafka/interfaces/line-chart.interface';
import { MssqlService } from '../mssql/mssql.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { GetExchangeQuery } from './dto/getExchangeQuery.dto';
import { GetLiquidityQueryDto } from './dto/getLiquidityQuery.dto';
import { GetMarketMapQueryDto } from './dto/getMarketMapQuery.dto';
import { MarketLiquidityQueryDto } from './dto/marketLiquidityQuery.dto';
import { MerchandisePriceQueryDto } from './dto/merchandisePriceQuery.dto';
import { NetForeignQueryDto } from './dto/netForeignQuery.dto';
import {
  ExchangeValueInterface,
  TickerByExchangeInterface
} from './interfaces/exchange-value.interface';
import { IndustryFullInterface } from './interfaces/industry-full.interface';
import { InternationalIndexInterface } from './interfaces/international-index.interface';
import { MarketVolatilityRawInterface } from './interfaces/market-volatility.interface';
import { MerchandisePriceInterface } from './interfaces/merchandise-price.interface';
import { NetForeignInterface } from './interfaces/net-foreign.interface';
import { SessionDatesInterface } from './interfaces/session-dates.interface';
import { StockEventsInterface } from './interfaces/stock-events.interface';
import { TopNetForeignByExInterface } from './interfaces/top-net-foreign-by-ex.interface';
import { TopNetForeignInterface } from './interfaces/top-net-foreign.interface';
import { TopRocInterface } from './interfaces/top-roc-interface';
import { BusinessResultsResponse } from './responses/businessResults.response';
import { DomesticIndexResponse } from './responses/DomesticIndex.response';
import { EnterprisesSameIndustryResponse } from './responses/enterprisesSameIndustry.response';
import { EventCalendarResponse } from './responses/eventCalendar.response';
import { FinancialIndicatorsResponse } from './responses/financialIndicators.response';
import { IndustryResponse } from './responses/Industry.response';
import { InternationalIndexResponse } from './responses/InternationalIndex.response';
import { InternationalSubResponse } from './responses/InternationalSub.response';
import { LiquidContributeResponse } from './responses/LiquidityContribute.response';
import { MarketMapResponse } from './responses/market-map.response';
import { MarketEvaluationResponse } from './responses/MarketEvaluation.response';
import { MarketLiquidityResponse } from './responses/MarketLiquidity.response';
import { MarketVolatilityResponse } from './responses/MarketVolatiliy.response';
import { MerchandisePriceResponse } from './responses/MerchandisePrice.response';
import { NetForeignResponse } from './responses/NetForeign.response';
import { NetTransactionValueResponse } from './responses/NetTransactionValue.response';
import { SearchStockResponse } from './responses/searchStock.response';
import { StockEventsResponse } from './responses/StockEvents.response';
import { StockNewsResponse } from './responses/StockNews.response';
import { TopNetForeignResponse } from './responses/TopNetForeign.response';
import { TopNetForeignByExResponse } from './responses/TopNetForeignByEx.response';
import { TopRocResponse } from './responses/TopRoc.response';
import { TransactionStatisticsResponse } from './responses/transaction-statistics.response';
import { UpDownTickerResponse } from './responses/UpDownTicker.response';

@Injectable()
export class StockService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource() private readonly db: DataSource,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly mssqlService: MssqlService,
  ) { }

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
        '[marketTrade].[dbo].[tickerTradeVND]',
        'date',
        this.dbServer,
      );
      //Calculate exchange volume

      if (!exchange) {
        exchange = (
          await this.dbServer.query(
            `
                    SELECT c.floor AS exchange, SUM(t.totalVal) as value
                    FROM [marketTrade].[dbo].[tickerTradeVND] t
                    JOIN [marketInfor].[dbo].[info] c ON c.code = t.code
                    WHERE [date] >= @0 and [date] <= @1
                    AND c.type in ('STOCK', 'ETF')
                    GROUP BY c.floor
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
            ALL: exchange?.['HOSE'] + exchange?.['HNX'] + exchange?.['UPCOM'],
          },
        );
        return {
          ...exchange,
          ALL: exchange?.['HOSE'] + exchange?.['HNX'] + exchange?.['UPCOM'],
        };
      }
    } catch (e) {
      throw new CatchException(e);
    }
  }

  public async getTickerPrice() {
    try {
      const { latestDate }: SessionDatesInterface = await this.getSessionDate(
        '[marketTrade].[dbo].[tickerTradeVND]',
        'date',
        this.dbServer,
      );
      //Calculate exchange volume
      let tickerPrice: any = await this.redis.get(RedisKeys.TickerPrice);
      if (tickerPrice) return tickerPrice;

      if (!tickerPrice) {
        tickerPrice = (
          await this.dbServer.query(
            `
              SELECT code as ticker, closePrice as price
              FROM [marketTrade].[dbo].[tickerTradeVND]
              WHERE [date] = @0
            `,
            [latestDate],
          )
        ).reduce((prev, curr) => {
          return { ...prev, [curr.ticker]: curr.price };
        }, {});
        await this.redis.set(RedisKeys.TickerPrice, tickerPrice);
        return tickerPrice;
      }
    } catch (e) { }
  }

  //Get the nearest day have transaction in session, week, month...
  public async getSessionDate(
    table: string,
    column: string = 'date_time',
    instance: any = this.db,
  ): Promise<SessionDatesInterface> {
    const redisData = await this.redis.get<SessionDatesInterface>(
      `${RedisKeys.SessionDate}:${table}:${column}`,
    );
    if (redisData) return redisData;

    let dateColumn = column;
    if (column.startsWith('[')) {
      dateColumn = column.slice(1, column.length - 1);
    }

    const lastYear = moment().subtract('1', 'year').format('YYYY-MM-DD');
    const firstDateYear = moment().startOf('year').format('YYYY-MM-DD');

    const dates = await instance.query(`
            SELECT DISTINCT TOP 20 ${column} FROM ${table}
            WHERE ${column} IS NOT NULL ORDER BY ${column} DESC 
        `);

    const query: string = `
          SELECT TOP 1 ${column}
          FROM ${table}
          WHERE ${column} IS NOT NULL
          AND ${column} >= @0
          ORDER BY ${column};
        `;
    const result = {
      latestDate: UtilCommonTemplate.toDate(dates[0]?.[dateColumn]),
      previousDate: UtilCommonTemplate.toDate(dates[1]?.[dateColumn]),
      weekDate: UtilCommonTemplate.toDate(dates[4]?.[dateColumn]),
      monthDate: UtilCommonTemplate.toDate(
        dates[dates.length - 1]?.[dateColumn],
      ),
      yearDate: UtilCommonTemplate.toDate(
        (await instance.query(query, [lastYear]))[0]?.[dateColumn],
      ),
      firstDateYear: UtilCommonTemplate.toDate(
        (await instance.query(query, [firstDateYear]))[0]?.[dateColumn],
      ),
    };

    await this.redis.set(`${RedisKeys.SessionDate}:${table}:${column}`, result);
    return result;
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
            return this.dbServer.query(query, [date]);
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
        await this.getSessionDate(
          '[marketTrade].[dbo].[tickerTradeVND]',
          'date',
          this.dbServer,
        );

      //Calculate exchange volume
      let exchange: ExchangeValueInterface[] = await this.getExchangesVolume(
        latestDate,
      );

      const query: string = `
                SELECT t.totalVal AS value, t.code as ticker, c.LV2 AS industry, c.floor AS exchange,
                ((t.totalVal - t2.totalVal) / NULLIF(t2.totalVal, 0)) * 100 AS value_change_percent
                FROM [marketTrade].[dbo].[tickerTradeVND] t
                JOIN [marketTrade].[dbo].[tickerTradeVND] t2 
                ON t.code = t2.code AND t2.[date] = @1
                JOIN [marketInfor].[dbo].[info] c ON c.code = t.code
                WHERE t.[date] = @0 AND c.type in ('STOCK', 'ETF')
            `;

      const data: TickerByExchangeInterface[] = await this.dbServer.query(
        query,
        [latestDate, previousDate],
      );
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
                SELECT e.date AS date, e.closePrice AS exchange_price, e.code AS exchange,
                    SUM(n.net_value_td) AS net_proprietary,
                    SUM(n.net_value_canhan) AS net_retail,
                    SUM(n.net_value_foreign) AS net_foreign
                FROM marketTrade.dbo.indexTradeVND e
                JOIN PHANTICH.dbo.BCN_netvalue n ON e.date = n.date_time
                WHERE e.code = @2 
                AND e.date <= @0 
                AND e.date >= @1
                GROUP BY e.date, e.closePrice, e.code
                ORDER BY date DESC
            `;
      return new NetTransactionValueResponse().mapToList(
        await this.dbServer.query(query, parameters),
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
                SELECT TOP 80 * FROM [macroEconomic].[dbo].[TinTuc]
                ORDER BY Date DESC
            `;
      const data = new StockNewsResponse().mapToList(
        await this.dbServer.query(query),
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
                SELECT TOP 80 * FROM [macroEconomic].[dbo].[TinTucViMo]
                ORDER BY Date DESC
            `;
      const data = new StockNewsResponse().mapToList(
        await this.dbServer.query(query),
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
      const query: string = `
        with DomesticIndex as (
            SELECT code as comGroupCode,
                  timeInday as time,
                  highPrice as indexValue,
                  change as indexChange,
                  totalVol as totalMatchVolume,
                  totalVal as totalMatchValue,
                  perChange as percentIndexChange,
                  rank() over (partition by code order by timeInday desc) as rank
            FROM tradeIntraday.dbo.indexTradeVNDIntraday
            WHERE code in ('VNINDEX', 'VN30', 'VNALL', 'HNX', 'HNX30', 'UPCOM')
                and date = (select max(date) from tradeIntraday.dbo.indexTradeVNDIntraday)
        ) select * from DomesticIndex
        where rank = 1
        order by comGroupCode desc;
      `;
      const dataToday: LineChartInterface[] = await this.mssqlService.query<
        LineChartInterface[]
      >(query);

      const mappedData: DomesticIndexResponse[] =
        new DomesticIndexResponse().mapToList(dataToday);

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
        SELECT c.floor as EXCHANGE, c.LV2, c.code as ticker, n.netVal AS total_value_${+transaction ? 'sell' : 'buy'
        }
        FROM [marketTrade].[dbo].[foreign] n
        JOIN [marketInfor].[dbo].[info] c
        ON c.code = n.code AND c.floor = @1
        WHERE date = @0 and n.netVal ${+transaction ? ' < 0 ' : ' > 0 '
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
                SELECT TOP 10 t1.ticker, c.floor AS exchange, 
                    SUM(t1.net_value_foreign) AS net_value
                FROM [PHANTICH].[dbo].[BCN_netvalue] t1
                JOIN [marketInfor].[dbo].[info] c
                ON t1.ticker = c.code
                WHERE c.floor = '${exchange.toUpperCase()}'
                AND t1.date_time >= @1
                AND t1.date_time <= @0
                GROUP BY t1.ticker, c.floor
                ORDER BY net_value ${order}
            `;

      const [dataTop, dataBot]: [
        TopNetForeignByExInterface[],
        TopNetForeignByExInterface[],
      ] = await Promise.all([
        this.dbServer.query(query('DESC'), [latestDate, weekDate]),
        this.dbServer.query(query('ASC'), [latestDate, weekDate]),
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
        'date_time',
        this.dbServer,
      );
      const date2: SessionDatesInterface = await this.getSessionDate(
        `[macroEconomic].[dbo].[HangHoa]`,
        'lastUpdated',
        this.dbServer,
      );

      const data3 = await this.dbServer.query(`
        select top 3 code as ticker, 
          closePrice as diemso, perChange as percent_d
        from [marketTrade].[dbo].[tickerTradeVND]
        order by date desc, perChange desc
      `);

      const query: string = `
                SELECT name AS ticker,lastUpdated AS date_time, price AS diemso, unit, 
                change1D AS percent_d,
                change5D AS percent_w,
                change1M AS percent_m, changeYTD AS percent_ytd
                FROM [macroEconomic].[dbo].[HangHoa]
                WHERE lastUpdated >= @0 and (name like '%WTI%' OR name like 'USD/VND' OR name like 'Vàng')
            `;
      const data2 = new InternationalSubResponse().mapToList(
        await this.dbServer.query(query, [date2.latestDate]),
      );

      const data: InternationalIndexInterface[] = await this.dbServer.query(
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

      const data: StockEventsInterface[] = await this.dbServer.query(`
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
        `[macroEconomic].[dbo].[HangHoa]`,
        'lastUpdated',
        this.dbServer,
      );

      const query: string = `
                SELECT name, price, unit, change1D AS Day,
                changeMTD AS MTD, changeYTD AS YTD
                FROM [macroEconomic].[dbo].[HangHoa]
                WHERE lastUpdated >= @0 and unit ${+type ? '=' : '!='} ''
            `;

      const data: MerchandisePriceInterface[] = await this.dbServer.query(
        query,
        [latestDate],
      );
      const mappedData: MerchandisePriceResponse[] =
        new MerchandisePriceResponse().mapToList(data);
      await this.redis.set(`${RedisKeys.MerchandisePrice}:${type}`, mappedData);
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
        await this.dbServer.query(`
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
                        sum(m.totalVal) as totalValueMil,
                        sum(m.totalVol) as totalVolume,
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
                       m.totalVal as totalValueMil,
                       m.totalVol as totalVolume,
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
                join marketTrade.dbo.tickerTradeVND m on c.TICKER = m.code
                and t.[DateTime] = m.date 
                where t.[DateTime] >= @0 and t.[DateTime] <= @1  ${ex} ${group} 
                order by totalValueMil desc
            `;

      const data = await this.dbServer.query(query, [
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
      const floor = ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;

      const redisData = await this.redis.get(
        `${RedisKeys.MarketMap}:${ex}:${order}`,
      );
      if (redisData) {
        return redisData;
      }

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
          WITH top15 AS (
            SELECT i.floor AS global, i.LV2 AS industry, c.code AS ticker, sum(c.buyVal) + sum(c.sellVal) AS value,
            ROW_NUMBER() OVER (PARTITION BY i.LV2 ORDER BY sum(c.buyVal) + sum(c.sellVal) DESC) AS rn
          FROM [marketTrade].[dbo].[foreign] c
          INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
          WHERE i.floor IN ${floor}
            AND c.date = @0
            AND i.[type] IN ('STOCK', 'ETF')
            AND I.status = 'listed'
            AND i.LV2 != ''
          GROUP BY i.floor, i.LV2, c.code
          )
          SELECT * FROM (
            SELECT global, industry, ticker, value
            FROM top15
            WHERE rn <= 15
            UNION ALL
            SELECT i.floor AS global, i.LV2 AS industry, 'KHÁC' AS ticker, SUM(c.buyVal + c.sellVal) AS value
            FROM [marketTrade].[dbo].[foreign] c
            INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
            WHERE i.floor IN ${floor}
              AND c.date = @0
              AND i.[type] IN ('STOCK', 'ETF')
              AND i.LV2 != ''
              AND I.status = 'listed'
              AND i.code NOT IN (SELECT ticker FROM top15 WHERE rn <= 15)
            GROUP BY i.floor, i.LV2
          ) AS resultredisData
          ORDER BY industry, CASE WHEN ticker = 'KHÁC' THEN 1 ELSE 0 END, value DESC;
        `;
        const mappedData = new MarketMapResponse().mapToList(
          await this.dbServer.query(query, [date]),
        );

        await this.redis.set(
          `${RedisKeys.MarketMap}:${ex}:${order}`,
          mappedData, { ttl: TimeToLive.FiveMinutes }
        );

        return mappedData;
      }

      if (+order === MarketMapEnum.MarketCap) {
        const floor =
          ex == 'ALL' ? ` ('HOSE', 'HNX', 'UPCOM') ` : ` ('${ex}') `;

        date = (
          await this.getSessionDate(
            '[RATIO].[dbo].[ratio]',
            'date',
            this.dbServer,
          )
        ).latestDate;

        const query: string = `
          WITH top15 AS (
              SELECT i.floor AS global, i.LV2 AS industry, c.code AS ticker, c.value,
                    ROW_NUMBER() OVER (PARTITION BY i.LV2 ORDER BY c.value DESC) AS rn
              FROM [RATIO].[dbo].[ratio] c
              INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
              WHERE i.floor IN ${floor}
                AND c.date = @0 AND c.ratioCode = 'MARKETCAP'
                AND i.[type] IN ('STOCK', 'ETF')
                AND i.LV2 != ''
              GROUP BY i.floor, i.LV2, c.code, c.value
          )
          SELECT * FROM (
              SELECT global, industry, ticker, value
              FROM top15
              WHERE rn <= 15
              UNION ALL
              SELECT i.floor AS global, i.LV2 AS industry, 'khác' AS ticker, SUM(c.value) AS value
              FROM [RATIO].[dbo].[ratio] c
              INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
              WHERE i.floor IN ${floor}
                AND c.date = @0 AND c.ratioCode = 'MARKETCAP'
                AND i.[type] IN ('STOCK', 'ETF')
                AND i.LV2 != ''
                AND i.code NOT IN (SELECT ticker FROM top15 WHERE rn <= 15)
              GROUP BY i.floor, i.LV2
          ) AS result
          ORDER BY industry, CASE WHEN ticker = 'khác' THEN 1 ELSE 0 END, value DESC;
        `;
        const mappedData = new MarketMapResponse().mapToList(
          await this.dbServer.query(query, [date]),
        );

        await this.redis.set(
          `${RedisKeys.MarketMap}:${ex}:${order}`,
          mappedData, { ttl: TimeToLive.FiveMinutes }
        );

        return mappedData;
      }

      let field: string;
      switch (parseInt(order)) {
        case MarketMapEnum.Value:
          field = 'totalVal';
          break;
        case MarketMapEnum.Volume:
          field = 'totalVol';
          break;
        default:
          throw new ExceptionResponse(
            HttpStatus.BAD_REQUEST,
            'order not found',
          );
      }

      const query: string = `
        WITH top15 AS (
              SELECT i.floor AS global, i.LV2 AS industry, c.code AS ticker, c.${field} as value,
                    ROW_NUMBER() OVER (PARTITION BY i.LV2 ORDER BY c.${field} DESC) AS rn
              FROM [marketTrade].[dbo].[tickerTradeVND] c
              INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
              WHERE i.floor IN ${floor}
                AND c.date = @0
                AND i.[type] IN ('STOCK', 'ETF')
                AND i.LV2 != ''
              GROUP BY i.floor, i.LV2, c.code, c.${field}
          )
          SELECT * FROM (
              SELECT global, industry, ticker, value
              FROM top15
              WHERE rn <= 15
              UNION ALL
              SELECT i.floor AS global, i.LV2 AS industry, 'khác' AS ticker, SUM(c.${field}) AS value
              FROM [marketTrade].[dbo].[tickerTradeVND] c
              INNER JOIN [marketInfor].[dbo].[info] i ON c.code = i.code
              WHERE i.floor IN ${floor}
                AND c.date = @0
                AND i.[type] IN ('STOCK', 'ETF')
                AND i.LV2 != ''
                AND i.code NOT IN (SELECT ticker FROM top15 WHERE rn <= 15)
              GROUP BY i.floor, i.LV2
          ) AS result
          ORDER BY industry, CASE WHEN ticker = 'khác' THEN 1 ELSE 0 END, value DESC;
      `;

      const mappedData = new MarketMapResponse().mapToList(
        await this.dbServer.query(query, [date]),
      );

      await this.redis.set(`${RedisKeys.MarketMap}:${ex}:${order}`, mappedData, { ttl: TimeToLive.FiveMinutes });

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

  async searchStock(key_search: string) {
    const query = `
    select code, LV2 as type, companyName as company_name, shortNameEng as short_name, floor from marketInfor.dbo.info
    where code like N'%${UtilCommonTemplate.normalizedString(key_search)}%' or lower(dbo.fn_RemoveVietNamese5(companyName)) like '%${UtilCommonTemplate.normalizedString(key_search)}%'
    `
    const data = await this.mssqlService.query<SearchStockResponse[]>(query)
    const dataMapped = SearchStockResponse.mapToList(data)
    return dataMapped
  }

  async transactionStatistics(stock: string) {
    const redisData = await this.redis.get(`${RedisKeys.transactionStatistics}:${stock.toUpperCase}`)
    if (redisData) return redisData

    const query = `
    WITH temp
    AS (SELECT TOP 6
      closePrice,
      totalVol,
      totalVal,
      t.date,
      closePrice - LEAD(closePrice) OVER (ORDER BY t.date DESC) AS change,
      ((closePrice - LEAD(closePrice) OVER (ORDER BY t.date DESC)) / LEAD(closePrice) OVER (ORDER BY t.date DESC)) * 100 AS perChange
    FROM marketTrade.dbo.tickerTradeVND t
    WHERE t.code = '${stock}'
    ORDER BY date DESC),
    vh
    AS (SELECT TOP 5
      value,
      date
    FROM RATIO.dbo.ratio
    WHERE code = '${stock}'
    AND ratioCode = 'MARKETCAP'
    ORDER BY date DESC),
    fo
    AS (SELECT TOP 5
      buyVal,
      sellVal,
      date
    FROM marketTrade.dbo.[foreign]
    WHERE code = '${stock}'
    ORDER BY date DESC)
    SELECT TOP 5
      closePrice,
      totalVol AS klgd,
      totalVal AS gtdd,
      t.date,
      change,
      perChange,
      value AS vh,
      buyVal AS nn_mua,
      sellVal AS nn_ban
    FROM temp t
    LEFT JOIN vh v
      ON t.date = v.date
    LEFT JOIN fo f
      ON f.date = t.date
    `
    const data = await this.mssqlService.query<TransactionStatisticsResponse[]>(query)
    const dataMapped = TransactionStatisticsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.transactionStatistics}:${stock.toUpperCase}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  private getNameBusinessResults(type: string){
    let name = ``
    switch (type) {
      case 'NH':
        name = `N'Thu nhập lãi thuần', N'Chi phí hoạt động', N'Tổng lợi nhuận trước thuế', N'Lợi nhuận sau thuế thu nhập doanh nghiệp', N'Lãi/Lỗ thuần từ hoạt động dịch vụ'`
        break;
      case 'BH':
        name = `N'7. Doanh thu thuần hoạt động kinh doanh bảo hiểm', N'20. Chi phí bán hàng', N'31. Tổng lợi nhuận trước thuế thu nhập doanh nghiệp', N'35. Lợi nhuận sau thuế thu nhập doanh nghiệp', N'8. Chi bồi thường bảo hiểm gốc, trả tiền bảo hiểm'`
        break;
      case 'CK':
        name = `N'Cộng doanh thu hoạt động', N'Cộng doanh thu hoạt động tài chính', N'31. Tổng lợi nhuận trước thuế thu nhập doanh nghiệp', N'XI. LỢI NHUẬN KẾ TOÁN SAU THUẾ TNDN', N'VII. KẾT QUẢ HOẠT ĐỘNG'`
        break;
      default:
        name = `N'3. Doanh thu thuần (1)-(2)', N'5. Lợi nhuận gộp (3)-(4)', N'18. Chi phí thuế TNDN (16)+(17)', N'15. Tổng lợi nhuận kế toán trước thuế (11)+(14)', N'19. Lợi nhuận sau thuế thu nhập doanh nghiệp (15)-(18)'`
        break;
    }
    return name
  }

  private getNameBalanceSheet(type: string){
    let name = ``
    switch (type) {
      case 'NH':
        name = `N'II. Tiền gửi tại NHNN', N'TỔNG CỘNG TÀI SẢN', N'III. Tiền gửi khách hàng', N'VIII. Chứng khoán đầu tư', N'VIII. Vốn chủ sở hữu'`
        break;
      case 'BH':
        name = `N'I. Tiền', N'TỔNG CỘNG TÀI SẢN', N'A. NỢ PHẢI TRẢ', N'IV. Hàng tồn kho', N'I. Vốn chủ sở hữu'`
        break;
      case 'CK':
        name = `N'I. Tài sản tài chính', N'I. Tài sản tài chính dài hạn', N'C. NỢ PHẢI TRẢ', N'TỔNG CỘNG TÀI SẢN', N'D. VỐN CHỦ SỞ HỮU'`
        break;
      default:
        name = `N'A. Tài sản lưu động và đầu tư ngắn hạn', N'B. Tài sản cố định và đầu tư dài hạn', N'A. Nợ phải trả', N'TỔNG CỘNG NGUỒN VỐN', N'I. Vốn chủ sở hữu'`
        break;
    }
    return name
  }

  async businessResults(stock: string, order: number, type: string) {
    const redisData = await this.redis.get(`${RedisKeys.businessResults}:${order}:${stock}:${type}`)
    if(redisData) return redisData

    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    const name = this.getNameBusinessResults(type)
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type = 'KQKD'
      AND f.name IN (${name})
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.businessResults}:${order}:${stock}:${type}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async balanceSheet(stock: string, order: number, type: string){
    const redisData = await this.redis.get(`${RedisKeys.balanceSheet}:${order}:${stock}:${type}`)
    if(redisData) return redisData
    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    const name = this.getNameBalanceSheet(type)
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type = 'CDKT'
      AND f.name IN (${name})
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.balanceSheet}:${order}:${stock}:${type}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async castFlow(stock: string, order: number){
    const redisData = await this.redis.get(`${RedisKeys.castFlow}:${order}:${stock}`)
    if(redisData) return redisData
    let group = ``
    let select = ``
    switch (order) {
      case TimeTypeEnum.Quarter:
        select = `value, yearQuarter as date`
        group = `order by yearQuarter desc`
        break;
        case TimeTypeEnum.Year:
          select = `sum(value) as value, cast(year as varchar) + '4' as date`
          group = `group by year, name order by year desc`
          break;
      default:
        break;
    }
    
    const query = `
      SELECT TOP 20
      LTRIM(RIGHT(name, LEN(name) - CHARINDEX('.', name))) as name,
        ${select}
      FROM financialReport.dbo.financialReportV2 f
      WHERE f.code = '${stock}'
      AND f.type like 'LC%'
      AND f.name IN (N'Lưu chuyển tiền thuần từ hoạt động kinh doanh', N'Lưu chuyển tiền thuần từ hoạt động đầu tư', N'Lưu chuyển tiền thuần trong kỳ', N'Tiền và tương đương tiền đầu kỳ', N'Tiền và tương đương tiền cuối kỳ')
      ${group}
    `
    const data = await this.mssqlService.query<BusinessResultsResponse[]>(query)
    const dataMapped = BusinessResultsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.castFlow}:${order}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }

  async financialIndicators(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.financialIndicators}:${stock}`)
    if(redisData) return redisData

    const query = `
    SELECT TOP 4
      EPS as eps,
      BVPS as bvps,
      PE as pe,
      ROE as roe,
      ROA as roa,
      yearQuarter
    FROM financialReport.dbo.calBCTC
    WHERE code = '${stock}'
    ORDER BY yearQuarter DESC
    `
    const data = await this.mssqlService.query<FinancialIndicatorsResponse[]>(query)
    const dataMapped = FinancialIndicatorsResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.financialIndicators}:${stock}`, dataMapped, { ttl: TimeToLive.OneWeek })
    return data
  }

  async enterprisesSameIndustry(stock: string, exchange: string){
    const redisData = await this.redis.get(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`)
    if(redisData) return redisData

    const query = `
      WITH temp
      AS (SELECT
        code
      FROM marketInfor.dbo.info
      WHERE LV2 = (SELECT
        LV2
      FROM marketInfor.dbo.info
      WHERE code = '${stock}')
      AND code != '${stock}' and floor = '${exchange}'),
      pivotted
      AS (SELECT
        *
      FROM (SELECT
        value,
        ratioCode,
        temp.code
      FROM temp
      INNER JOIN RATIO.dbo.ratio r
        ON temp.code = r.code
      WHERE ratioCode IN ('PRICE_TO_BOOK', 'PRICE_TO_EARNINGS', 'MARKETCAP')
      AND r.date = '2023-07-25') AS source PIVOT (SUM(value) FOR ratioCode IN ([PRICE_TO_BOOK], [PRICE_TO_EARNINGS], [MARKETCAP])) AS chuyen)
      SELECT
        p.code as code,
        t.closePrice,
        t.totalVol as kl,
        PRICE_TO_EARNINGS AS pe,
        PRICE_TO_BOOK AS pb,
        MARKETCAP AS vh
      FROM temp p
      INNER JOIN marketTrade.dbo.tickerTradeVND t
        ON t.code = p.code
      INNER JOIN pivotted
        ON pivotted.code = p.code
      WHERE t.date = '2023-07-25'
    `
    const data = await this.mssqlService.query<EnterprisesSameIndustryResponse[]>(query)
    const dataMapped = EnterprisesSameIndustryResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.enterprisesSameIndustry}:${exchange}:${stock}`, dataMapped, { ttl: TimeToLive.HaftHour })
    return dataMapped
  }

  async eventCalendar(stock: string){
    const redisData = await this.redis.get(`${RedisKeys.eventCalendar}:${stock}`)
    if(redisData) return redisData

    const query = `
    SELECT
      NgayDKCC as date,
      NoiDungSuKien as content
    FROM PHANTICH.dbo.LichSukien
    WHERE ticker = '${stock}'
    ORDER BY NgayDKCC DESC
    `
    const data = await this.mssqlService.query<EventCalendarResponse[]>(query)
    const dataMapped = EventCalendarResponse.mapToList(data)
    await this.redis.set(`${RedisKeys.eventCalendar}:${stock}`, dataMapped, { ttl: TimeToLive.OneDay })
    return dataMapped
  }
}
