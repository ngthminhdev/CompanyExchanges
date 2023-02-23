import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { ExceptionResponse } from '../exceptions/common.exception';
import { MRequest } from '../types/middleware';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: MRequest = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const bearer: string = request.headers.authorization;
    res.redirect('');
    //logic decode, validate token ...
    if (!bearer) {
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Token not found!');
    }

    const token: string = bearer.split(' ')[1];

    if (!token) {
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Token not found!');
    }

    return true;
  }
}
