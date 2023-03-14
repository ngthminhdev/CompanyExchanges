import {Injectable, Logger} from '@nestjs/common';
import {Server} from "socket.io";
import {SocketEmit} from "../enums/socket-enum";
import {MarketBreadthKafkaInterface} from "./interfaces/market-breadth-kafka.interface";

@Injectable()
export class KafkaService {
    private logger = new Logger(KafkaService.name);
    constructor() {}

    send<T>(event: string, message: T): void {
        const server: Server = global._server;
        server.emit(event, message);
    }

    handleMarketBreadth(payload: MarketBreadthKafkaInterface): void {
        this.send(SocketEmit.DoRongThiTruong, payload)
    }
}
