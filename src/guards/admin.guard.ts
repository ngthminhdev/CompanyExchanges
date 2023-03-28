import {CanActivate, ExecutionContext, HttpStatus, Injectable,} from '@nestjs/common';
import {ExceptionResponse} from '../exceptions/common.exception';
import {MRequest} from '../types/middleware';
import {JwtService} from "@nestjs/jwt";
import {RoleEnum} from "../enums/auth.enum";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
      private readonly jwtService: JwtService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: MRequest = context.switchToHttp().getRequest();
    const bearer: string = request.headers.authorization;
    const token: string = bearer.split(' ')[1];
    if (!bearer || !token) {
      throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Token not found!');
    }

    const decoded: any = await this.jwtService.decode(token);
    if (decoded.role != RoleEnum.Admin) {
      throw new ExceptionResponse(HttpStatus.FORBIDDEN, 'You are not allowed to do that!')
    }

    return true;
  }
}
