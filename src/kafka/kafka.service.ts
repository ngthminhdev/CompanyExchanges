import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Server } from 'socket.io';
import { DataSource } from 'typeorm';
import { DB_SERVER } from '../constants';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { SocketEmit } from '../enums/socket-enum';
import { CatchSocketException } from '../exceptions/socket.exception';
import { SessionDatesInterface } from '../stock/interfaces/session-dates.interface';
import { isDecrease, isEqual, isHigh, isIncrease, isLow } from '../stock/processes/industry-data-child';
import { IndustryResponse } from '../stock/responses/Industry.response';
import { MarketBreadthResponse } from '../stock/responses/MarketBreadth.response';
import { StockService } from '../stock/stock.service';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ChartNenInterface } from './interfaces/chart-nen.interface';
import { DomesticIndexKafkaInterface } from './interfaces/domestic-index-kafka.interface';
import { ForeignKafkaInterface } from './interfaces/foreign-kafka.interface';
import { LineChartInterfaceV2 } from './interfaces/line-chart.interface';
import { MarketBreadthKafkaInterface } from './interfaces/market-breadth-kafka.interface';
import { MarketCashFlowInterface } from './interfaces/market-cash-flow.interface';
import { MarketLiquidityKafkaInterface } from './interfaces/market-liquidity-kakfa.interface';
import { TickerChangeInterface } from './interfaces/ticker-change.interface';
import { TickerContributeKafkaInterface } from './interfaces/ticker-contribute-kafka.interface';
import { TickerIndustryInterface } from './interfaces/ticker-industry.interface';
import { DomesticIndexKafkaResponse } from './responses/DomesticIndexKafka.response';
import { ForeignKafkaResponse } from './responses/ForeignResponseKafka.response';
import { LineChartResponseV2 } from './responses/LineChart.response';
import { MarketCashFlowResponse } from './responses/MarketCashFlow.response';
import { MarketVolatilityKafkaResponse } from './responses/MarketVolatilityKafka.response';
import { TickerContributeKafkaResponse } from './responses/TickerContributeKafka.response';
import { TopNetForeignKafkaResponse } from './responses/TopNetForeignKafka.response';

@Injectable()
export class KafkaService {
  private logger = new Logger(KafkaService.name);

  constructor(
    // @InjectDataSource()
    // private readonly db: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
    private readonly stockService: StockService
  ) { }

  send<T>(event: string, message: T): void {
    try {
      const server: Server = global._server;
      server.emit(event, message);
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  async getTickerInIndustry(): Promise<TickerIndustryInterface[]> {
    const redisData = await this.redis.get<TickerIndustryInterface[]>(
      RedisKeys.TickerIndustry,
    );
    if (redisData) return redisData;

    const data = await this.dbServer.query(`
            select distinct t.code as ticker, c.LV2 as industry from [marketTrade].[dbo].[tickerTradeVND] t
            inner join [marketInfor].[dbo].[info] c
            on c.code = t.code
        `);
    await this.redis.set(RedisKeys.TickerIndustry, data);
    return data;
  }

  async getTickerArrFromRedis(key: string) {
    const tickerArr: string[] = (await this.redis.get<any>(key))?.map(
      (i) => i.ticker,
    );
    return tickerArr;
  }

  async getTickerArrayByEx() {
    const hose: string[] = await this.getTickerArrFromRedis(RedisKeys.HOSE);
    const hnx: string[] = await this.getTickerArrFromRedis(RedisKeys.HNX);
    const upcom: string[] = await this.getTickerArrFromRedis(RedisKeys.UPCoM);

    return { hose, hnx, upcom };
  }

  getTickerInEx = async (ex: string): Promise<any> => {
    let data = await this.redis.get(RedisKeys[ex]);
    if (!data) {
      data = await this.dbServer.query(`
                    select distinct ticker from [COPHIEUANHHUONG].[dbo].[${ex}] ORDER BY ticker;
                `);
      await this.redis.set(RedisKeys[ex], data, TimeToLive.Forever);
    }
    return data;
  };

  private async filterAndSortPayload(
    payload: ForeignKafkaInterface[],
    floor: string,
    netVal: number,
  ) {
    const tickerIndustry = await this.getTickerInIndustry();

    const tickerList = _(payload)
      .filter((item) => item.floor === floor && item.netVal * netVal > 0)
      .map((item) => ({
        ...item,
        industry: tickerIndustry.find((i) => i.ticker === item.code)?.industry,
      }))
      .filter((i) => i.industry !== undefined)
      .sortBy('netVal')
      .value();

    return new ForeignKafkaResponse().mapToList([...tickerList]);
  }

  handleMarketBreadth(payload: MarketBreadthKafkaInterface[]): void {
    this.send(
      SocketEmit.DoRongThiTruong,
      new MarketBreadthResponse().mapToList(payload),
    );
  }

  handleMarketBreadthHNX(payload: MarketBreadthKafkaInterface[]): void {
    this.send(
      SocketEmit.DoRongThiTruongHNX,
      new MarketBreadthResponse().mapToList(payload),
    );
  }

  handleMarketLiquidityNow(payload: MarketLiquidityKafkaInterface): void {
    this.send(SocketEmit.ThanhKhoanPhienHienTai, payload);
  }

  async handleIndustry() {
    const {
      latestDate,
      previousDate,
      weekDate,
      monthDate,
      firstDateYear,
    }: SessionDatesInterface = await this.getSessionDate(
      '[RATIO].[dbo].[ratioInday]',
      'date',
      this.dbServer
    );
    const marketCapQuery = `
        SELECT
        i.date AS date_time,
        sum(i.closePrice * i.shareout)  AS total_market_cap,
        f.LV2 as industry
        FROM RATIO.dbo.ratioInday i
        inner join marketInfor.dbo.info f on f.code = i.code
        WHERE i.date IN ('${UtilCommonTemplate.toDate(latestDate)}', 
        '${UtilCommonTemplate.toDate(previousDate)}', 
        '${UtilCommonTemplate.toDate(weekDate)}', 
        '${UtilCommonTemplate.toDate(monthDate)}', 
        '${UtilCommonTemplate.toDate(
      firstDateYear,
    )}')
        GROUP BY f.LV2, i.date
        ORDER BY i.date DESC
        `

    const marketCap = await this.dbServer.query(marketCapQuery)
    const groupByIndustry = marketCap.reduce((result, item) => {
      (result[item.industry] || (result[item.industry] = [])).push(item);
      return result;
    }, {});

    //Calculate change percent per day, week, month
    const industryChanges = Object.entries(groupByIndustry).map(
      ([industry, values]: any) => {
        return {
          industry,
          day_change_percent: !values[1]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[1].total_market_cap) /
              values[1].total_market_cap) *
            100,
          week_change_percent: !values[2]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[2].total_market_cap) /
              values[2].total_market_cap) *
            100,
          month_change_percent: !values[3]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[3].total_market_cap) /
              values[3].total_market_cap) *
            100,
          ytd: !values[4]?.total_market_cap ? 0 :
            ((values[0].total_market_cap - values[4]?.total_market_cap) /
              values[4].total_market_cap) *
            100,
        };
      },
    );

    const query = (date): string => `
          SELECT
            i.LV2 AS industry,
            t.code AS ticker,
            t.closePrice AS close_price,
            t.highPrice AS high,
            t.lowPrice AS low,
            t.date AS date_time
          FROM marketTrade.dbo.tickerTradeVND t
          INNER JOIN marketInfor.dbo.info i
            ON t.code = i.code
          WHERE t.date = '${date}'
          `
    const dataToday = await this.dbServer.query(query(latestDate))
    const dataYesterday = await this.dbServer.query(query(previousDate))

    const result = dataToday.map((item) => {
      const yesterdayItem = dataYesterday.find(i => i.ticker === item.ticker);
      if (!yesterdayItem) return;
      return {
        industry: item.industry,
        equal: isEqual(yesterdayItem, item),
        increase: isIncrease(yesterdayItem, item),
        decrease: isDecrease(yesterdayItem, item),
        high: isHigh(yesterdayItem, item),
        low: isLow(yesterdayItem, item),
      };
    });

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
    const query_buy_sell = `
                    select sum(CAST(Khoi_luong_cung AS float)) as sellPressure, sum(CAST(Khoi_luong_cau AS float)) as buyPressure
                    from [PHANTICH].[dbo].[INDEX_AC_CC]
                    where Ticker in ('VNINDEX', 'HNXINDEX', 'UPINDEX')
                `;
    const buySellData = await this.dbServer.query(query_buy_sell)

    const mappedData: IndustryResponse[] = [
      ...new IndustryResponse().mapToList(final),
    ].sort((a, b) => (a.industry > b.industry ? 1 : -1));

    this.send(SocketEmit.PhanNganh, { data: mappedData, buySellData: buySellData?.[0] });
    return { data: mappedData, buySellData: buySellData?.[0] }
  }

  async handleIndustryFloor() {
    const array = [
      { floor: 'HSX', event: SocketEmit.PhanNganhHOSE },
      { floor: 'HNX', event: SocketEmit.PhanNganhHNX },
      { floor: 'UPCOM', event: SocketEmit.PhanNganhUPCOM },
    ]
    const {
      latestDate,
      previousDate,
      weekDate,
      monthDate,
      firstDateYear,
    }: SessionDatesInterface = await this.getSessionDate(
      '[RATIO].[dbo].[ratioInday]',
      'date',
      this.dbServer
    );

    const marketCapQuery = `
      SELECT
      i.date AS date_time,
      sum(i.closePrice * i.shareout)  AS total_market_cap,
      f.LV2 as industry,
      f.floor
      FROM RATIO.dbo.ratioInday i
      inner join marketInfor.dbo.info f on f.code = i.code
      WHERE i.date IN ('${UtilCommonTemplate.toDate(latestDate)}', 
      '${UtilCommonTemplate.toDate(previousDate)}', 
      '${UtilCommonTemplate.toDate(weekDate)}', 
      '${UtilCommonTemplate.toDate(monthDate)}', 
      '${UtilCommonTemplate.toDate(
      firstDateYear,
    )}')
      GROUP BY f.LV2, i.date, f.floor
      ORDER BY i.date DESC
      `
    const marketCapPromise = this.dbServer.query(marketCapQuery)

    const query = (date): string => `
        SELECT
          i.LV2 AS industry,
          t.code AS ticker,
          t.closePrice AS close_price,
          t.highPrice AS high,
          t.lowPrice AS low,
          t.date AS date_time,
          i.floor
        FROM marketTrade.dbo.tickerTradeVND t
        INNER JOIN marketInfor.dbo.info i
          ON t.code = i.code
        WHERE t.date = '${date}'
        `
      const dataTodayPromise = this.dbServer.query(query(latestDate))
      const dataYesterdayPromise = this.dbServer.query(query(previousDate))

      const [marketCap, dataToday, dataYesterday] = await Promise.all([marketCapPromise, dataTodayPromise, dataYesterdayPromise])

    for (const exchange of array) {
      const groupByIndustry = marketCap.filter(item => item.floor == exchange.floor).reduce((result, item) => {
        (result[item.industry] || (result[item.industry] = [])).push(item);
        return result;
      }, {});

      //Calculate change percent per day, week, month
      const industryChanges = Object.entries(groupByIndustry).map(
        ([industry, values]: any) => {
          return {
            industry,
            day_change_percent: !values[1]?.total_market_cap ? 0 :
              ((values[0].total_market_cap - values[1].total_market_cap) /
                values[1].total_market_cap) *
              100,
            week_change_percent: !values[2]?.total_market_cap ? 0 :
              ((values[0].total_market_cap - values[2].total_market_cap) /
                values[2].total_market_cap) *
              100,
            month_change_percent: !values[3]?.total_market_cap ? 0 :
              ((values[0].total_market_cap - values[3].total_market_cap) /
                values[3].total_market_cap) *
              100,
            ytd: !values[4]?.total_market_cap ? 0 :
              ((values[0].total_market_cap - values[4]?.total_market_cap) /
                values[4].total_market_cap) *
              100,
          };
        },
      )

      const result = dataToday.filter(item => item.floor == exchange.floor).map((item) => {
        const yesterdayItem = dataYesterday.filter(item => item.floor == exchange.floor).find(i => i.ticker === item.ticker);
        if (!yesterdayItem) return;
        return {
          industry: item.industry,
          equal: isEqual(yesterdayItem, item),
          increase: isIncrease(yesterdayItem, item),
          decrease: isDecrease(yesterdayItem, item),
          high: isHigh(yesterdayItem, item),
          low: isLow(yesterdayItem, item),
        };
      });

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


      let ex = '';
      switch (exchange.floor) {
        case 'HSX':
          ex = 'VNINDEX';
          break;
        case 'HNX':
          ex = 'HNXINDEX';
          break;
        default:
          ex = 'UPINDEX';
      }
      let query_buy_sell: string = `
              select top 1 Khoi_luong_cung as sellPressure, Khoi_luong_cau as buyPressure
              from [PHANTICH].[dbo].[INDEX_AC_CC]
              where Ticker = '${ex}' order by
              [DateTime] desc
          `;
      const buySellData = await this.dbServer.query(query_buy_sell)

      const mappedData: IndustryResponse[] = [
        ...new IndustryResponse().mapToList(final),
      ].sort((a, b) => (a.industry > b.industry ? 1 : -1));

      this.send(exchange.event, { data: mappedData, buySellData: buySellData?.[0] });
    }
  }

  handleDomesticIndex(payload: DomesticIndexKafkaInterface[]): void {
    this.send(
      SocketEmit.ChiSoTrongNuoc,
      [...new DomesticIndexKafkaResponse().mapToList(payload)].sort((a, b) =>
        a.ticker > b.ticker ? -1 : 1,
      ),
    );
  }

  handleDomesticIndex2(payload: LineChartInterfaceV2[]): void {
    this.send(
      SocketEmit.ChiSoTrongNuoc2,
      [...payload].sort((a, b) => (a.code > b.code ? -1 : 1)),
    );
  }

  handleMarketVolatility(payload: any): void {
    this.send(
      SocketEmit.BienDongThiTruong,
      [...new MarketVolatilityKafkaResponse().mapToList(payload)].sort((a, b) =>
        a.ticker > b.ticker ? -1 : 1,
      ),
    );
  }

  async handleTopRocHNX(payload: TickerChangeInterface[]): Promise<void> {
    try {
      const data: Pick<TickerChangeInterface, 'ticker'>[] =
        await this.getTickerInEx('HNX');
      const tickerInExchanges = data
        .map((record) => {
          return payload.find((item) => item.ticker == record.ticker);
        })
        .filter((item) => !!item);

      this.send(SocketEmit.TopRocHNX, tickerInExchanges);
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  async handleTopRocUPCOM(payload: TickerChangeInterface[]): Promise<void> {
    try {
      const data: Pick<TickerChangeInterface, 'ticker'>[] =
        await this.getTickerInEx('UPCoM');
      const tickerInExchanges = data
        .map((record) => {
          return payload.find((item) => item.ticker == record.ticker);
        })
        .filter((item) => !!item);

      this.send(SocketEmit.TopRocUPCOM, tickerInExchanges);
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  async handleTopRocHSX(payload: TickerChangeInterface[]): Promise<void> {
    try {
      const data: Pick<TickerChangeInterface, 'ticker'>[] =
        await this.getTickerInEx('HOSE');
      const tickerInExchanges = data
        .map((record) => {
          return payload.find((item) => item.ticker == record.ticker);
        })
        .filter((item) => !!item);

      this.send(SocketEmit.TopRocHSX, tickerInExchanges);
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  async handleTickerContribute(payload: TickerContributeKafkaInterface[]) {
    try {
      //1d
      const HSXData = UtilCommonTemplate.getTop10HighestAndLowestData(
        payload.filter((item) => item.floor === 'HSX'),
        'point',
      );
      const HNXData = UtilCommonTemplate.getTop10HighestAndLowestData(
        payload.filter((item) => item.floor === 'HNX'),
        'point',
      );
      const VN30Data = UtilCommonTemplate.getTop10HighestAndLowestData(
        payload.filter((item) => item.floor === 'VN30'),
        'point',
      );

      //sent
      this.send(
        SocketEmit.HsxTickerContribute0,
        new TickerContributeKafkaResponse().mapToList(HSXData, 'point'),
      );
      this.send(
        SocketEmit.HnxTickerContribute0,
        new TickerContributeKafkaResponse().mapToList(HNXData, 'point'),
      );
      this.send(
        SocketEmit.VN30TickerContribute0,
        new TickerContributeKafkaResponse().mapToList(VN30Data, 'point'),
      );
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  handleLineChart(payload: LineChartInterfaceV2[]) {
    payload.forEach((item) => {
      switch (item.code) {
        case 'VNINDEX':
          this.send(
            SocketEmit.ChiSoVnIndex,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        case 'VNXALL':
          this.send(
            SocketEmit.ChiSoVNAll,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        case 'VN30':
          this.send(
            SocketEmit.ChiSoVN30,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        case 'HNX30':
          this.send(
            SocketEmit.ChiSoHNX30,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        case 'HNXINDEX':
          this.send(
            SocketEmit.ChiSoHNX,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        case 'UPINDEX':
          this.send(
            SocketEmit.ChiSoUPCOM,
            LineChartResponseV2.mapToList([item]),
          );
          break;
        default:
        // this.logger.error('Invalid IndexCode');
      }
    });
  }

  handleStockValue(payload: MarketCashFlowInterface[]) {
    const calculatedData: any = payload.reduce(
      (prev, curr) => {
        if (
          curr.index === 'VNINDEX' ||
          curr.index === 'HNX' ||
          curr.index === 'UPCOM'
        ) {
          if (curr.changePrice1d > 0) {
            return {
              ...prev,
              increase: prev.increase + curr.accumulatedVal,
            };
          } else if (curr.changePrice1d < 0) {
            return {
              ...prev,
              decrease: prev.decrease + curr.accumulatedVal,
            };
          } else if (curr.changePrice1d == 0) {
            return {
              ...prev,
              equal: prev.equal + curr.accumulatedVal,
            };
          }
        }
        return prev;
      },
      {
        equal: 0,
        increase: 0,
        decrease: 0,
      },
    );

    this.send(
      SocketEmit.PhanBoDongTien,
      new MarketCashFlowResponse(calculatedData),
    );
  }


  async handleForeign(payload: ForeignKafkaInterface[]) {
    const tickerBuyHSX = await this.filterAndSortPayload(payload, 'HOSE', 1);
    const tickerBuyHNX = await this.filterAndSortPayload(payload, 'HNX', 1);
    const tickerBuyUPCOM = await this.filterAndSortPayload(payload, 'UPCOM', 1);

    const tickerSellHSX = await this.filterAndSortPayload(payload, 'HOSE', -1);
    const tickerSellHNX = await this.filterAndSortPayload(payload, 'HNX', -1);
    const tickerSellUPCOM = await this.filterAndSortPayload(
      payload,
      'UPCOM',
      -1,
    );

    this.send(SocketEmit.ForeignBuyHSX, tickerBuyHSX);
    this.send(SocketEmit.ForeignBuyHNX, tickerBuyHNX);
    this.send(SocketEmit.ForeignBuyUPCOM, tickerBuyUPCOM);

    this.send(SocketEmit.ForeignSellHSX, tickerSellHSX);
    this.send(SocketEmit.ForeignSellHNX, tickerSellHNX);
    this.send(SocketEmit.ForeignSellUPCOM, tickerSellUPCOM);
  }

  async handleTopForeign(payload: ForeignKafkaInterface[]) {
    //get ticker andd filter by ex
    const { hose, hnx, upcom } = await this.getTickerArrayByEx();

    const HSXTicker = payload.filter((ticker) => hose?.includes(ticker.code));
    const HNXTicker = payload.filter((ticker) => hnx?.includes(ticker.code));
    const UPTicker = payload.filter((ticker) => upcom?.includes(ticker.code));

    //send

    const HSXData = UtilCommonTemplate.getTop10HighestAndLowestData(
      HSXTicker,
      'netVal',
    );

    const HNXData = UtilCommonTemplate.getTop10HighestAndLowestData(
      HNXTicker,
      'netVal',
    );

    const UPData = UtilCommonTemplate.getTop10HighestAndLowestData(
      UPTicker,
      'netVal',
    );

    this.send(
      SocketEmit.TopForeignHOSE,
      new TopNetForeignKafkaResponse().mapToList(HSXData),
    );

    this.send(
      SocketEmit.TopForeignHNX,
      new TopNetForeignKafkaResponse().mapToList(HNXData),
    );

    this.send(
      SocketEmit.TopForeignUPCOM,
      new TopNetForeignKafkaResponse().mapToList(UPData),
    );
  }

  handleChartNen(payload: ChartNenInterface[]) {
    payload.map(item => {
      this.send(`${SocketEmit.CoPhieu}-${item.code}`, {
        ...item, time: Date.UTC(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          moment(item.timeInday, 'HH:mm:ss').hour(),
          moment(item.timeInday, 'HH:mm:ss').minute(),
        ).valueOf()
      })
    }
    )
  }

  public async getSessionDate(
    table: string,
    column: string = 'date_time',
    instance: any = this.dbServer,
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
}
