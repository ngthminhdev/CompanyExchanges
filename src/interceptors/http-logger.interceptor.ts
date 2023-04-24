import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import {Observable} from 'rxjs';
import {MRequest} from "../types/middleware"

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
    private logger = new Logger('HTTP-Logger');

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const req: MRequest = context.switchToHttp().getRequest();
        const {realIP, method, originalUrl} = req;
        this.logger.log(`url:${originalUrl}, method:${method}, ip:${realIP}`);
        return next.handle();
    }
}
