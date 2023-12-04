import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_SERVER } from '../constants';
import { QueueEnum } from '../enums/queue.enum';
import { PhoneNumberInterceptor } from '../interceptors/phone-number.interceptor';
import { QueueService } from '../queue/queue.service';
import { SmsService } from '../sms/sms.service';
import { UserEntity } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeviceEntity } from './entities/device.entity';
import { VerifyEntity } from './entities/verify.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, UserEntity, VerifyEntity], DB_SERVER),
    //queue
    BullModule.registerQueue({ name: QueueEnum.MainProcessor }),
    UserModule
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PhoneNumberInterceptor,
    },
    UserService,
    AuthService,
    JwtService,
    SmsService,
    QueueService
  ],
  exports: [AuthService]
})
export class AuthModule {}

// implements NestModule {
//   configure(consumer: MiddlewareConsumer): void {
//     consumer.apply(DeviceIdMiddleware).forRoutes('/auth/*');
//     // .apply(SignVerifyMiddleware)
//     // .forRoutes("*");
//   }
// }
