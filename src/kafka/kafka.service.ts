import {CACHE_MANAGER, Inject, Injectable, Logger} from '@nestjs/common';
import {Server} from "socket.io";
import {SocketEmit} from "../enums/socket-enum";
import {MarketBreadthKafkaInterface} from "./interfaces/market-breadth-kafka.interface";
import {MarketLiquidityKafkaInterface} from "./interfaces/market-liquidity-kakfa.interface";
import {CatchSocketException} from "../exceptions/socket.exception";
import {IndustryKafkaInterface} from "./interfaces/industry-kafka.interface";
import {IndustryKafkaResponse} from "./responses/IndustryKafka.response";
import {DomesticIndexKafkaInterface} from "./interfaces/domestic-index-kafka.interface";
import {DomesticIndexKafkaResponse} from "./responses/DomesticIndexKafka.response";
import {MarketVolatilityKafkaResponse} from "./responses/MarketVolatilityKafka.response";
import {TickerChangeInterface} from "./interfaces/ticker-change.interface";
import {DataSource} from "typeorm";
import {Cache} from "cache-manager";
import {InjectDataSource} from "@nestjs/typeorm";
import {RedisKeys} from "../enums/redis-keys.enum";
import {TimeToLive} from "../enums/common.enum";
import {LineChartInterface} from "./interfaces/line-chart.interface";
import {MarketBreadthResponse} from '../stock/responses/MarketBreadth.response';
import {LineChartResponse} from "./responses/LineChart.response";
import {MarketCashFlowInterface} from "./interfaces/market-cash-flow.interface";
import {MarketCashFlowResponse} from "./responses/MarketCashFlow.response";
import * as _ from 'lodash';
import { ForeignKafkaInterface } from './interfaces/foreign-kafka.interface';
import { log } from 'console';
import { TickerIndustryInterface } from './interfaces/ticker-industry.interface';
import { ForeignKafkaResponse } from './responses/ForeignResponseKafka.response';

@Injectable()
export class KafkaService {
    private logger = new Logger(KafkaService.name);

    constructor(
        @InjectDataSource()
        private readonly db: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
    ) {
    }

    send<T>(event: string, message: T): void {
        try {
            const server: Server = global._server;
            server.emit(event, message);
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    async getTickerInIndustry(): Promise<TickerIndustryInterface[]> {
        const redisData = await this.redis.get<TickerIndustryInterface[]>(RedisKeys.TickerIndustry);
        if (redisData) return redisData;

        const data = await this.db.query(`
            select distinct t.ticker, c.LV2 as industry from [PHANTICH].[dbo].[database_mkt] t
            inner join [PHANTICH].[dbo].[ICBID] c
            on c.ticker = t.ticker
        `)
        await this.redis.set(RedisKeys.TickerIndustry, data);
        return data;
    }

    async getTickerArrFromRedis(key: string) {
        const tickerArr: string[] = (await this.redis.get<any>(key)).map(i => i.ticker);
        return tickerArr;
    }

    getTop10HighestAndLowestData(data: any[], field: string) {
        const sortedData = _.sortBy(data, field);
        const top10Highest = _.takeRight(sortedData, 10);
        const top10Lowest = _.take(sortedData, 10).reverse();
        return [...top10Highest, ...top10Lowest];
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
    }

    handleMarketBreadth(payload: MarketBreadthKafkaInterface[]): void {
        this.send(SocketEmit.DoRongThiTruong, new MarketBreadthResponse().mapToList(payload))
    }

    handleMarketLiquidityNow(payload: MarketLiquidityKafkaInterface): void {
        this.send(SocketEmit.ThanhKhoanPhienHienTai, payload)
    }

    handleIndustry(payload: IndustryKafkaInterface[]): void {
        this.send(SocketEmit.PhanNganh, [...new IndustryKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.industry > b.industry ? 1 : -1))
    }

    handleDomesticIndex(payload: DomesticIndexKafkaInterface[]): void {
        this.send(SocketEmit.ChiSoTrongNuoc, [...new DomesticIndexKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.ticker > b.ticker ? -1 : 1))
    }

    handleMarketVolatility(payload: any): void {
        this.send(SocketEmit.BienDongThiTruong, [...new MarketVolatilityKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.ticker > b.ticker ? -1 : 1))
    }

    async handleTopRocHNX(payload: TickerChangeInterface[]): Promise<void> {
        try {
            const data: Pick<TickerChangeInterface, 'ticker'>[] = await this.getTickerInEx('HNX');
            const tickerInExchanges = (data.map((record) => {
                return payload.find((item) => item.ticker == record.ticker);
            })).filter((item) => !!item);

            this.send(SocketEmit.TopRocHNX, tickerInExchanges);
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    async handleTopRocUPCOM(payload: TickerChangeInterface[]): Promise<void> {
        try {
            const data: Pick<TickerChangeInterface, 'ticker'>[] = await this.getTickerInEx('UPCoM');
            const tickerInExchanges = (data.map((record) => {
                return payload.find((item) => item.ticker == record.ticker);
            })).filter((item) => !!item);

            this.send(SocketEmit.TopRocUPCOM, tickerInExchanges);
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    async handleTopRocHSX(payload: TickerChangeInterface[]): Promise<void>  {
        try {
            const data: Pick<TickerChangeInterface, 'ticker'>[] = await this.getTickerInEx('HOSE');
            const tickerInExchanges = (data.map((record) => {
                return payload.find((item) => item.ticker == record.ticker);
            })).filter((item) => !!item);

            this.send(SocketEmit.TopRocHSX, tickerInExchanges);
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    async handleTickerContribute(payload: TickerChangeInterface[]) {
        try {
            const hsxTickerArr: string[] = await this.getTickerArrFromRedis(RedisKeys.HOSE);
            const hnxTickerArr: string[] = await this.getTickerArrFromRedis(RedisKeys.HNX);
            const upcomTickerArr: string[] = await this.getTickerArrFromRedis(RedisKeys.UPCoM);

            const HSXTicker = payload.filter(ticker => hsxTickerArr.includes(ticker.ticker));
            const HNXTicker = payload.filter(ticker => hsxTickerArr.includes(ticker.ticker));
            const UPTicker = payload.filter(ticker => hsxTickerArr.includes(ticker.ticker));

            //1d
            const hsx1dData = this.getTop10HighestAndLowestData(HSXTicker, '1D')
            const hnx1dData = this.getTop10HighestAndLowestData(HNXTicker, '1D');
            const up1dData = this.getTop10HighestAndLowestData(UPTicker, '1D');


            //5d
            const hsx5dData = this.getTop10HighestAndLowestData(HSXTicker, '5D')
            const hnx5dData = this.getTop10HighestAndLowestData(HNXTicker, '5D');
            const up5dData = this.getTop10HighestAndLowestData(UPTicker, '5D');


            //sent
            this.send(SocketEmit.HsxTickerContribute1, hsx1dData);
            this.send(SocketEmit.HnxTickerContribute1, hnx1dData);
            this.send(SocketEmit.UpTickerContribute1, up1dData);

            this.send(SocketEmit.HsxTickerContribute5, hsx5dData);
            this.send(SocketEmit.HnxTickerContribute5, hnx5dData);
            this.send(SocketEmit.UpTickerContribute5, up5dData);

        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    handleVNIndex(payload: LineChartInterface[]) {
        this.send(SocketEmit.ChiSoVnIndex, new LineChartResponse().mapToList(payload))
    }

    handleLineChart(payload: LineChartInterface[]) {
        payload.forEach((item) => {
            switch (item.comGroupCode) {
                case 'VNINDEX':
                    this.send(SocketEmit.ChiSoVnIndex, new LineChartResponse().mapToList([item]))
                break;
                case 'VNXALL':
                    this.send(SocketEmit.ChiSoVNAll, new LineChartResponse().mapToList([item]))
                    break;
                case 'VN30':
                    this.send(SocketEmit.ChiSoVN30, new LineChartResponse().mapToList([item]))
                    break;
                case 'HNX30':
                    this.send(SocketEmit.ChiSoHNX30, new LineChartResponse().mapToList([item]))
                    break;
                case 'HNXINDEX':
                    this.send(SocketEmit.ChiSoHNX, new LineChartResponse().mapToList([item]))
                    break;
                case 'UPINDEX':
                    this.send(SocketEmit.ChiSoUPCOM, new LineChartResponse().mapToList([item]))
                    break;
                default:
                    this.logger.error('Invalid IndexCode')
            }
        })
    }

    handleStockValue(payload: MarketCashFlowInterface[]) {
        const calculatedData: any = payload.reduce((prev, curr) => {
            if (curr.index === 'VNINDEX' || curr.index === 'HNX' || curr.index === 'UPCOM') {
                if (curr.changePrice1d > 0) {
                    return {
                        ...prev,
                        increase: prev.increase + curr.accumulatedVal,
                    }
                } else if (curr.changePrice1d < 0) {
                    return {
                        ...prev,
                        decrease: prev.decrease + curr.accumulatedVal,
                    }
                } else if (curr.changePrice1d == 0) {
                    return {
                        ...prev,
                        equal: prev.equal + curr.accumulatedVal,
                    }
                }
            }
            return prev;
        }, {
            equal: 0,
            increase: 0,
            decrease: 0
        });

        this.send(SocketEmit.PhanBoDongTien, new MarketCashFlowResponse(calculatedData))
    }

    async handleForeign(payload: ForeignKafkaInterface[]) {
        const tickerIndustry = await this.getTickerInIndustry();

        const tickerHSX = payload.filter(item => item.floor === 'HOSE').map(item => ({...item, industy: tickerIndustry.find(i => i.ticker === item.code)}));
        const tickerHNX = payload.filter(item => item.floor === 'HNX').map(item => ({...item, industy: tickerIndustry.find(i => i.ticker === item.code)}));
        const tickerUPCOM = payload.filter(item => item.floor === 'UPCOM').map(item => ({...item, industy: tickerIndustry.find(i => i.ticker === item.code)}));

        
        this.send(SocketEmit.ForeignHSX, new ForeignKafkaResponse().mapToList(tickerHSX));
        this.send(SocketEmit.ForeignHNX, new ForeignKafkaResponse().mapToList(tickerHNX));
        this.send(SocketEmit.ForeignUPCOM, new ForeignKafkaResponse().mapToList(tickerUPCOM));

    }
}
