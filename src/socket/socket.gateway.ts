import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import {SocketService} from './socket.service';
import {Server, Socket} from "socket.io";
import {Logger} from "@nestjs/common";

@WebSocketGateway({cors: {origin: '*'}, namespace: 'socket'})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    logger = new Logger('SocketLogger')
    @WebSocketServer() server: Server;

    constructor(private readonly socketService: SocketService) {
    }

    afterInit(server: any) {
        this.logger.log('Server Init!')
    }

    handleConnection(client: Socket) {
        this.logger.log(client.id + ' Connected!')
    }

    handleDisconnect(client: any) {
        this.logger.log(client.id + ' Disconnected!')
    }


    @SubscribeMessage('socket')
    create(@MessageBody() message: any) {
        try {
            this.server.emit('hear', message)
        } catch (e) {
            this.logger.error(e)
        }
    }
}
