import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity, UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
