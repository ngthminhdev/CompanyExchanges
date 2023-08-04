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
import { MarketBreadthResponse } from '../stock/responses/MarketBreadth.response';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ChartNenInterface } from './interfaces/chart-nen.interface';
import { DomesticIndexKafkaInterface } from './interfaces/domestic-index-kafka.interface';
import { ForeignKafkaInterface } from './interfaces/foreign-kafka.interface';
import { IndustryKafkaInterface } from './interfaces/industry-kafka.interface';
import { LineChartInterfaceV2 } from './interfaces/line-chart.interface';
import { MarketBreadthKafkaInterface } from './interfaces/market-breadth-kafka.interface';
import { MarketCashFlowInterface } from './interfaces/market-cash-flow.interface';
import { MarketLiquidityKafkaInterface } from './interfaces/market-liquidity-kakfa.interface';
import { TickerChangeInterface } from './interfaces/ticker-change.interface';
import { TickerContributeKafkaInterface } from './interfaces/ticker-contribute-kafka.interface';
import { TickerIndustryInterface } from './interfaces/ticker-industry.interface';
import { DomesticIndexKafkaResponse } from './responses/DomesticIndexKafka.response';
import { ForeignKafkaResponse } from './responses/ForeignResponseKafka.response';
import { IndustryKafkaResponse } from './responses/IndustryKafka.response';
import { LineChartResponseV2 } from './responses/LineChart.response';
import { MarketCashFlowResponse } from './responses/MarketCashFlow.response';
import { MarketVolatilityKafkaResponse } from './responses/MarketVolatilityKafka.response';
import { TickerContributeKafkaResponse } from './responses/TickerContributeKafka.response';
import { TopNetForeignKafkaResponse } from './responses/TopNetForeignKafka.response';

@Injectable()
export class KafkaService {
  private logger = new Logger(KafkaService.name);

  constructor(
    @InjectDataSource()
    private readonly db: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
    @InjectDataSource(DB_SERVER) private readonly dbServer: DataSource,
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
      data = await this.db.query(`
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

  handleIndustry(payload: IndustryKafkaInterface[]): void {
    this.send(
      SocketEmit.PhanNganh,
      [...new IndustryKafkaResponse().mapToList(payload)].sort((a, b) =>
        a.industry > b.industry ? 1 : -1,
      ),
    );
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

}
