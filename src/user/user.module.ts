import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../auth/entities/device.entity';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "../auth/auth.service";
import {QueueEnum} from "../enums/queue.enum";
import {BullModule} from "@nestjs/bull";
import {SmsService} from "../sms/sms.service";
import {QueueService} from "../queue/queue.service";
import {VerifyEntity} from "../auth/entities/verify.entity";
import { DB_SERVER } from '../constants';

@Module({
  imports: [
    
    TypeOrmModule.forFeature([DeviceEntity, UserEntity, VerifyEntity]),

    //queue
    BullModule.registerQueue(
        {name: QueueEnum.MainProcessor}
    ),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, AuthService, QueueService, SmsService],
})
export class UserModule {}
