import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueEnum } from '../enums/queue.enum';
import { PhoneNumberInterceptor } from '../interceptors/phone-number.interceptor';
import { DeviceIdMiddleware } from '../middlewares/device-di.middleware';
import { QueueService } from '../queue/queue.service';
import { SmsService } from '../sms/sms.service';
import { UserEntity } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeviceEntity } from './entities/device.entity';
import { VerifyEntity } from './entities/verify.entity';
import { DB_SERVER } from '../constants';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    
    TypeOrmModule.forFeature([DeviceEntity, UserEntity, VerifyEntity]),
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
    QueueService,
  ],
})
export class AuthModule {}

// implements NestModule {
//   configure(consumer: MiddlewareConsumer): void {
//     consumer.apply(DeviceIdMiddleware).forRoutes('/auth/*');
//     // .apply(SignVerifyMiddleware)
//     // .forRoutes("*");
//   }
// }
