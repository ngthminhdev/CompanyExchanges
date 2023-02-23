import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ExceptionResponse } from '../exceptions/common.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers.authorization;

    //logic decode, validate token ...
    if (!bearer) {
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Token not found!');
    }

    const token = bearer.split(' ')[1];

    if (!token) {
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Token not found!');
    }

    return true;
  }
}
