import {CacheModule, MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {KafkaModule as KafkaConfigModule} from 'nestjs-config-kafka';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from './auth/auth.module';
import {ConfigModuleModule} from './config-module/config-module.module';
import {ConfigServiceProvider} from './config-module/config-module.service';
import {StockModule} from './stock/stock.module';
import {UserModule} from './user/user.module';
import {ClientProxyFactory} from '@nestjs/microservices';
import {SocketModule} from './socket/socket.module';
import {KafkaModule} from "./kafka/kafka.module";
import {MacMiddleware} from "./middlewares/mac.middleware";

@Module({
    imports: [
        //env
        ConfigModule.forRoot({isGlobal: true}),

        //ORM
        TypeOrmModule.forRootAsync({
            imports: [ConfigModuleModule],
            useFactory: (config: ConfigServiceProvider) =>
                config.createTypeOrmOptions(),
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
        StockModule,
        AuthModule,
        UserModule,
        SocketModule,
        KafkaModule,
    ],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(MacMiddleware)
            .forRoutes('*')
    }
}
