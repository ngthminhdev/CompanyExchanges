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
import {VnIndexResponse} from "../stock/responses/Vnindex.response";
import { MarketBreadthResponse } from '../stock/responses/MarketBreadth.response';
import {LineChartResponse} from "./responses/LineChart.response";

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

    async handleTopRocHSX(payload: TickerChangeInterface[]): Promise<void> {
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

    handleVNIndex(payload: LineChartInterface[]) {
        this.send(SocketEmit.ChiSoVnIndex, new LineChartResponse().mapToList(payload))
    }

    handleLineChart(payload: LineChartInterface[]) {
        payload.forEach((item) => {
            switch (item.comGroupCode) {
                case 'VNINDEX':
                    this.send(SocketEmit.ChiSoVnIndex, new LineChartResponse().mapToList(payload))
                break;
                case 'VNXALL':
                    this.send(SocketEmit.ChiSoVNAll, new LineChartResponse().mapToList(payload))
                    break;
                case 'VN30':
                    this.send(SocketEmit.ChiSoVNAll, new LineChartResponse().mapToList(payload))
                    break;
                case 'HNX30':
                    this.send(SocketEmit.ChiSoHNX30, new LineChartResponse().mapToList(payload))
                    break;
                case 'HNXINDEX':
                    this.send(SocketEmit.ChiSoHNX, new LineChartResponse().mapToList(payload))
                    break;
                case 'UPINDEX':
                    this.send(SocketEmit.ChiSoUPCOM, new LineChartResponse().mapToList(payload))
                    break;
                default:
                    this.logger.error('Invalid IndexCode')
            }
        })
    }
}
