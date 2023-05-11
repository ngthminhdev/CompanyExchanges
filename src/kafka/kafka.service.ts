import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import { Server } from 'socket.io';
import { DataSource } from 'typeorm';
import { TimeToLive } from '../enums/common.enum';
import { RedisKeys } from '../enums/redis-keys.enum';
import { SocketEmit } from '../enums/socket-enum';
import { CatchSocketException } from '../exceptions/socket.exception';
import { MarketBreadthResponse } from '../stock/responses/MarketBreadth.response';
import { UtilCommonTemplate } from '../utils/utils.common';
import { DomesticIndexKafkaInterface } from './interfaces/domestic-index-kafka.interface';
import { ForeignKafkaInterface } from './interfaces/foreign-kafka.interface';
import { IndustryKafkaInterface } from './interfaces/industry-kafka.interface';
import { LineChartInterface } from './interfaces/line-chart.interface';
import { MarketBreadthKafkaInterface } from './interfaces/market-breadth-kafka.interface';
import { MarketCashFlowInterface } from './interfaces/market-cash-flow.interface';
import { MarketLiquidityKafkaInterface } from './interfaces/market-liquidity-kakfa.interface';
import { TickerChangeInterface } from './interfaces/ticker-change.interface';
import { TickerIndustryInterface } from './interfaces/ticker-industry.interface';
import { DomesticIndexKafkaResponse } from './responses/DomesticIndexKafka.response';
import { ForeignKafkaResponse } from './responses/ForeignResponseKafka.response';
import { IndustryKafkaResponse } from './responses/IndustryKafka.response';
import { LineChartResponse } from './responses/LineChart.response';
import { MarketCashFlowResponse } from './responses/MarketCashFlow.response';
import { MarketVolatilityKafkaResponse } from './responses/MarketVolatilityKafka.response';
import { TopNetForeignKafkaResponse } from './responses/TopNetForeignKafka.response';
import { industries } from './chores';
import { TickerContributeKafkaResponse } from './responses/TickerContributeKafka.response';

@Injectable()
export class KafkaService {
  private logger = new Logger(KafkaService.name);

  constructor(
    @InjectDataSource()
    private readonly db: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly redis: Cache,
  ) {}

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

    const data = await this.db.query(`
            select distinct t.ticker, c.LV2 as industry from [PHANTICH].[dbo].[database_mkt] t
            inner join [PHANTICH].[dbo].[ICBID] c
            on c.ticker = t.ticker
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

  handleDomesticIndex2(payload: LineChartInterface[]): void {
    this.send(
      SocketEmit.ChiSoTrongNuoc2,
      payload.sort((a, b) => (a.comGroupCode > b.comGroupCode ? -1 : 1)),
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

  async getDataTickerContribute(payload: any, exchange: string, field: string) {
    const tickerArr = await this.getTickerArrayByEx();
    const data = payload.filter((item) =>
      tickerArr?.[exchange].includes(item.ticker),
    );
    const result = new TickerContributeKafkaResponse().mapToList(
      [...UtilCommonTemplate.getTop10HighestAndLowestData(data, field)],
      field,
    );
    return result;
  }

  async handleTickerContribute(payload: TickerChangeInterface[]) {
    try {
      //1d
      const hsx1dData = await this.getDataTickerContribute(
        payload,
        'hose',
        '%1D',
      );

      const hnx1dData = await this.getDataTickerContribute(
        payload,
        'hnx',
        '%1D',
      );
      const up1dData = await this.getDataTickerContribute(
        payload,
        'upcom',
        '%1D',
      );

      //5d
      const hsx5dData = await this.getDataTickerContribute(
        payload,
        'hose',
        '%5D',
      );
      const hnx5dData = await this.getDataTickerContribute(
        payload,
        'hnx',
        '%5D',
      );
      const up5dData = await this.getDataTickerContribute(
        payload,
        'upcom',
        '%5D',
      );

      //sent
      this.send(SocketEmit.HsxTickerContribute0, hsx1dData);
      this.send(SocketEmit.HnxTickerContribute0, hnx1dData);
      this.send(SocketEmit.UpTickerContribute0, up1dData);

      this.send(SocketEmit.HsxTickerContribute1, hsx5dData);
      this.send(SocketEmit.HnxTickerContribute1, hnx5dData);
      this.send(SocketEmit.UpTickerContribute1, up5dData);
    } catch (e) {
      throw new CatchSocketException(e);
    }
  }

  handleLineChart(payload: LineChartInterface[]) {
    payload.forEach((item) => {
      switch (item.comGroupCode) {
        case 'VNINDEX':
          this.send(
            SocketEmit.ChiSoVnIndex,
            new LineChartResponse().mapToList([item]),
          );
          break;
        case 'VNXALL':
          this.send(
            SocketEmit.ChiSoVNAll,
            new LineChartResponse().mapToList([item]),
          );
          break;
        case 'VN30':
          this.send(
            SocketEmit.ChiSoVN30,
            new LineChartResponse().mapToList([item]),
          );
          break;
        case 'HNX30':
          this.send(
            SocketEmit.ChiSoHNX30,
            new LineChartResponse().mapToList([item]),
          );
          break;
        case 'HNXINDEX':
          this.send(
            SocketEmit.ChiSoHNX,
            new LineChartResponse().mapToList([item]),
          );
          break;
        case 'UPINDEX':
          this.send(
            SocketEmit.ChiSoUPCOM,
            new LineChartResponse().mapToList([item]),
          );
          break;
        default:
          this.logger.error('Invalid IndexCode');
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

  async getTickerAndIndustry(data) {
    const { hose, hnx, upcom } = await this.getTickerArrayByEx();
    const tickerIndustry = await this.getTickerInIndustry();

    return data
      .filter((ticker) => hose?.includes(ticker.ticker))
      .map((item) => {
        const industry = tickerIndustry.find(
          (i) => i.ticker == item.ticker,
        )?.industry;
        return {
          ...item,
          industry: industry || '',
        };
      });
  }

  async handleIndustryByEx(payload: TickerChangeInterface[]) {
    const { hose, hnx, upcom } = await this.getTickerArrayByEx();
    const tickerIndustry = await this.getTickerInIndustry();

    const HOSETicker = payload
      // .filter((ticker) => hose?.includes(ticker.ticker))
      .map((item) => {
        const industry = tickerIndustry.find(
          (i) => i.ticker == item.ticker,
        )?.industry;
        return {
          ...item,
          vietnameseName: industry || '',
        };
      });
    const HNXTicker = payload.filter((ticker) => hnx?.includes(ticker.ticker));
    const UPTicker = payload.filter((ticker) => upcom?.includes(ticker.ticker));
  }
}
