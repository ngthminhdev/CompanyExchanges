import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Socket } from 'socket.io';

@Catch()
export class SocketErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client: Socket = ctx.getClient();

        client.emit('error', {
            message: 'An error occurred while processing your request.',
            status: 500,
        });
    }
}
