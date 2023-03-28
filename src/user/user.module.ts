import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../auth/entities/device.entity';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "../auth/auth.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, DeviceEntity])],
  controllers: [UserController],
  providers: [UserService, JwtService, AuthService],
})
export class UserModule {}
