import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export class ExceptionResponse extends HttpException {
  constructor(status?: HttpStatus, message?: string, data?: any) {
    super(
      {
        status: status ? status : HttpStatus.BAD_REQUEST,
        message: message ? message : 'Dữ liệu không hợp lệ!',
        data: data || null,
      },
      HttpStatus.OK,
    );
  }
}

export class CatchException extends ExceptionResponse {
  constructor(error: any) {
    super(error?.response?.status || HttpStatus.BAD_REQUEST, error.message);
    CatchException.getStackTrace(error.message);
  }

  static getStackTrace(message?: string) {
    const obj = {} as any;
    Error.captureStackTrace(obj, this.getStackTrace);
    const logger = new Logger('ErrorService', {
      timestamp: true,
    });

    const originFile = obj.stack.split('\n')[2].split('/');
    const fileName = originFile[originFile.length - 1].split(':')[0];
    const lineNumber = +originFile[originFile.length - 1].split(':')[1];
    const path = obj.stack
      .split('at ')[2]
      .trim()
      .split(' ')[1]
      .replace('(', '')
      .replace(')', '');

    logger.error(
      `Message: ${message} - File: ${fileName} - Line: ${lineNumber} - Path: ${path}`,
    );
  }
}
