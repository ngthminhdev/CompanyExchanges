import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from '@nestjs/websockets';
import {SocketService} from './socket.service';
import {Server, Socket} from "socket.io";
import {Logger, UseFilters} from "@nestjs/common";
import {SocketErrorFilter} from "../filters/socket-error.filter";
import {CatchSocketException} from "../exceptions/socket.exception";

@WebSocketGateway({cors: {origin: '*'}, namespace: 'socket', transports: ['websocket']})
@UseFilters(SocketErrorFilter)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    logger = new Logger('SocketLogger')
    @WebSocketServer() server: Server;

    constructor(
        private readonly socketService: SocketService,
    ) {
    }

    afterInit(server: any) {
        this.logger.log('Server Init!')
    }

    handleConnection(client: Socket) {
        try {
            const token: string = client.handshake.headers.authorization;
            // if (!token) throw new WsException('Unauthenticated!');
            console.log(token);
            console.log(client.data)
            client.data.token = token;
            this.logger.log(client.id + ' Connected!')
        } catch (e) {
            client.disconnect()
            throw new CatchSocketException(e)
        }
        // console.log(client)
    }

    handleDisconnect(client: any) {
        this.logger.log(client.id + ' Disconnected!')
    }


    @SubscribeMessage('socket')
    create(client: Socket, payload: any,) {
        try {
            const token: string = client.data.token;
            console.log(token);


            this.server.emit('socket', payload.text);
            // throw new WsException('Co loi abcd')
        } catch (e) {
            throw new CatchSocketException(e)
        }
    }
}
