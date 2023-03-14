import { Injectable } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-store';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import {TimeToLive} from "../enums/common.enum";

@Injectable()
export class  ConfigServiceProvider {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: parseInt(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      schema: 'dbo',
      // database: process.env.MSSQL_DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // entities: [CityEntity, DistrictEntity, WardEntity, UserEntity, AuthEntity],
      autoLoadEntities: true,
      synchronize: false,
      options: { encrypt: false },
      // logging: true,
    };
  }

  createJwtOptions(): JwtModuleOptions {
    return {
    };
  }

  async createRedisOptions(): Promise<any> {
    return {
      store: await redisStore({
        // url: process.env.REDIS_URL,
        url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
        ttl: TimeToLive.FiveMinutes,
        socket: {
          connectTimeout: 60000
        }
      }),
    };
  }

  createKafkaConfig(): KafkaOptions {
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
          clientId: process.env.KAFKA_CLIENT_ID,
          // logCreator: () => () => {},
        },

        consumer: {
          groupId: process.env.KAFKA_GROUP_ID,
          allowAutoTopicCreation: true,
          readUncommitted: true,
          heartbeatInterval: 59 * 1000,
          sessionTimeout: 60 * 1000,
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner,
        },
        // producerOnlyMode: true,
        subscribe: { fromBeginning: false },
        send: {
          acks: 0,
        },
      },
    };
  }
}
