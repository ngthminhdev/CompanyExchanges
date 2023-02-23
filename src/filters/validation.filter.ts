import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const status = exception.getStatus();
    const res = exception.getResponse() as any;

    response.status(HttpStatus.OK).json({
      status: status,
      message: res?.message,
      data: null,
    });
  }
}
