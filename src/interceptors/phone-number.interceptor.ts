import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PhoneNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const phone: string = request?.body?.phone
    if (phone && phone[0] === '0') {
      request.body.phone = `+84${phone.slice(1)}`;
    }
    return next.handle();
  }
}
