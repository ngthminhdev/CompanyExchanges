import {Injectable, Logger} from '@nestjs/common';
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

@Injectable()
export class KafkaService {
    private logger = new Logger(KafkaService.name);
    // server: Server = global._server;

    send<T>(event: string, message: T): void {
        try {
            const server: Server = global._server;
            server.emit(event, message);
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }

    handleMarketBreadth(payload: MarketBreadthKafkaInterface): void {
        this.send(SocketEmit.DoRongThiTruong, payload)
    }

    handleMarketLiquidityNow(payload: MarketLiquidityKafkaInterface): void {
        this.send(SocketEmit.ThanhKhoanPhienHienTai, payload)
    }

    handleIndustry(payload: IndustryKafkaInterface[]) {
        this.send(SocketEmit.PhanNganh, [...new IndustryKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.industry > b.industry ? 1 : -1))
    }

    handleDomesticIndex(payload: DomesticIndexKafkaInterface[]) {
        this.send(SocketEmit.ChiSoTrongNuoc, [...new DomesticIndexKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.ticker > b.ticker ? -1 : 1))
    }

    handleMarketVolatility(payload: any) {
        this.send(SocketEmit.BienDongThiTruong, [...new MarketVolatilityKafkaResponse()
            .mapToList(payload)].sort((a,b) => a.ticker > b.ticker ? -1 : 1))
    }

    handleTickerChange(payload: any) {
        this.send(SocketEmit.TickerChange, payload)
    }
}
