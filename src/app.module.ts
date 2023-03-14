import {CacheModule, MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import * as cors from 'cors'
import {ConfigModule} from '@nestjs/config';
import {KafkaModule as KafkaConfigModule} from 'nestjs-config-kafka';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthModule} from './auth/auth.module';
import {ConfigModuleModule} from './config-module/config-module.module';
import {ConfigServiceProvider} from './config-module/config-module.service';
import {CityEntity} from './models/city.entity';
import {DistrictEntity} from './models/district.entity';
import {WardEntity} from './models/ward.entity';
import {StockModule} from './stock/stock.module';
import {UserModule} from './user/user.module';
import {ClientProxyFactory} from '@nestjs/microservices';
import {KafkaModule} from './kafka/kafka.module';
import {SocketModule} from './socket/socket.module';

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
        TypeOrmModule.forFeature([CityEntity, DistrictEntity, WardEntity]),

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
        // KafkaConfigModule.registerAsync({
        //   imports: [ConfigModuleModule],
        //   useFactory: (config: ConfigServiceProvider) =>
        //     ClientProxyFactory.create(config.createKafkaConfig()),
        //   inject: [ConfigServiceProvider],
        // }),

        //aplication modules
        ConfigModuleModule,
        StockModule,
        AuthModule,
        UserModule,
        // SocketModule,
        // KafkaModule,
    ],
})

// export class AppModule implements NestModule {
//     configure(consumer: MiddlewareConsumer) {
//         consumer
//             .apply(cors({
//                 // origin: process.env.WHITELIST_IPS.split(','), // add your IP whitelist here
//                 origin: [
//                     'http://192.168.15.181',
//                     'http://192.168.15.211',
//                     'http://192.168.9.250:3000',
//                 ], // add your IP whitelist here
//                 methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//                 preflightContinue: false,
//                 optionsSuccessStatus: 204,
//                 credentials: true,
//                 allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
//             }))
//             .forRoutes('*');
//     }
// }

export class AppModule {}
