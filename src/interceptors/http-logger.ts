import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HttpLogger implements NestInterceptor {
  private logger = new Logger('HTTP-Logger');
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { ip, method, originalUrl } = req;
    this.logger.log(`url:${originalUrl}, method:${method}, ip:${ip}`);
    return next.handle();
  }
}
