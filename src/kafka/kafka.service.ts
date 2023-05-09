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
import { UtilCommonTemplate } from '../utils/utils.common';

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
    const tickerArr: string[] = (await this.redis.get<any>(key)).map(
      (i) => i.ticker,
    );
    return tickerArr;
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

  handleMarketBreadth(payload: MarketBreadthKafkaInterface[]): void {
    this.send(
      SocketEmit.DoRongThiTruong,
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

  async handleTickerContribute(payload: TickerChangeInterface[]) {
    try {
      const hsxTickerArr: string[] = await this.getTickerArrFromRedis(
        RedisKeys.HOSE,
      );
      const hnxTickerArr: string[] = await this.getTickerArrFromRedis(
        RedisKeys.HNX,
      );
      const upcomTickerArr: string[] = await this.getTickerArrFromRedis(
        RedisKeys.UPCoM,
      );

      const HSXTicker = payload.filter((ticker) =>
        hsxTickerArr.includes(ticker.ticker),
      );
      const HNXTicker = payload.filter((ticker) =>
        hnxTickerArr.includes(ticker.ticker),
      );
      const UPTicker = payload.filter((ticker) =>
        upcomTickerArr.includes(ticker.ticker),
      );

      //1d
      const hsx1dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        HSXTicker,
        '1D',
      );
      const hnx1dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        HNXTicker,
        '1D',
      );
      const up1dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        UPTicker,
        '1D',
      );

      //5d
      const hsx5dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        HSXTicker,
        '5D',
      );
      const hnx5dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        HNXTicker,
        '5D',
      );
      const up5dData = UtilCommonTemplate.getTop10HighestAndLowestData(
        UPTicker,
        '5D',
      );

      //sent
      this.send(SocketEmit.HsxTickerContribute1, hsx1dData);
      this.send(SocketEmit.HnxTickerContribute1, hnx1dData);
      this.send(SocketEmit.UpTickerContribute1, up1dData);

      this.send(SocketEmit.HsxTickerContribute5, hsx5dData);
      this.send(SocketEmit.HnxTickerContribute5, hnx5dData);
      this.send(SocketEmit.UpTickerContribute5, up5dData);
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
    const data = UtilCommonTemplate.getTop10HighestAndLowestData(
      payload,
      'netVal',
    );
    this.send(
      SocketEmit.TopForeign,
      new TopNetForeignKafkaResponse().mapToList(data),
    );
  }
}
