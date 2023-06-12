import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { SocketErrorFilter } from '../filters/socket-error.filter';
import { CatchSocketException } from '../exceptions/socket.exception';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'socket' })
@UseFilters(SocketErrorFilter)
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  logger = new Logger('SocketLogger');
  @WebSocketServer() server: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: any) {
    this.logger.log('Server Init!');
    global._server = this.server;
  }

  handleConnection(client: Socket) {
    try {
      const token: string = client.handshake.headers.authorization;
      client.data.token = token;
      this.logger.log(client.id + ' Connected!');
    } catch (e) {
      client.disconnect();
      throw new CatchSocketException(e);
    }
  }

  handleDisconnect(client: any) {
    this.logger.log(client.id + ' Disconnected!');
  }
}
