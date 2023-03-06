import {ArgumentsHost, Catch, WsExceptionFilter} from '@nestjs/common';
import {Socket} from 'socket.io';
import {WsException} from "@nestjs/websockets";

@Catch(WsException)
export class SocketErrorFilter implements WsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client: Socket = ctx.getClient();
        const error: any = exception.message

        client.emit('error', {error});
    }
}
