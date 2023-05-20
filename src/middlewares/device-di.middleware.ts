import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { MRequest } from '../types/middleware';
import { UtilCommonTemplate } from '../utils/utils.common';
import { ExceptionResponse } from '../exceptions/common.exception';

@Injectable()
export class DeviceIdMiddleware implements NestMiddleware {
  async use(req: MRequest, res: Response, next: NextFunction) {
    const userAgent: string = req.headers['user-agent'];
    const realIp: any =
      req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress;
    const mac: string = req.headers.mac;
    if (!mac) {
      throw new ExceptionResponse(
        HttpStatus.BAD_REQUEST,
        'Yêu cầu không hợp lệ!',
      );
    }
    req.deviceId = UtilCommonTemplate.generateDeviceId(userAgent, mac);
    req.realIP = realIp;
    next();
  }
}
