import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule as KafkaConfigModule } from 'ngthminhdev-nestjs-kafka';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleModule } from './config-module/config-module.module';
import { ConfigServiceProvider } from './config-module/config-module.service';
import { StockModule } from './stock/stock.module';
import { UserModule } from './user/user.module';
import { ClientProxyFactory } from '@nestjs/microservices';
import { SocketModule } from './socket/socket.module';
import { KafkaModule } from './kafka/kafka.module';
import { QueueModule } from './queue/queue.module';
import { RealIpMiddleware } from './middlewares/real-ip.middleware';
import { DB_SERVER } from './constants';
import { MarketModule } from './market/market.module';
import { MssqlModule } from './mssql/mssql.module';
import { MacroModule } from './macro/macro.module';
import { RetailModule } from './retail/retail.module';

@Module({
  imports: [
    //env
    ConfigModule.forRoot({ isGlobal: true }),

    //ORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) =>
        config.createTypeOrmOptions(),
      inject: [ConfigServiceProvider],
    }),
    TypeOrmModule.forRootAsync({
      name: DB_SERVER,
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) =>
        config.createMssqlOptions(),
      inject: [ConfigServiceProvider],
    }),
    // TypeOrmModule.forFeature([DeviceEntity, UserEntity]),

    //jwt
    JwtModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createJwtOptions(),
      inject: [ConfigServiceProvider],
    }),

    //redis
    CacheModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: async (config: ConfigServiceProvider) => {
        return await config.createRedisOptions();
      },
      isGlobal: true,
      inject: [ConfigServiceProvider],
    }),

    //kakfa
    KafkaConfigModule.registerAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) =>
        ClientProxyFactory.create(config.createKafkaConfig()),
      inject: [ConfigServiceProvider],
    }),

    //aplication modules
    ConfigModuleModule,
    MssqlModule,
    StockModule,
    AuthModule,
    UserModule,
    QueueModule,
    SocketModule,
    MarketModule,
    MacroModule,
    KafkaModule,
    RetailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RealIpMiddleware).forRoutes('*');
  }
}
