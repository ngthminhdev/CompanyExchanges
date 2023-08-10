import { Injectable } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { TimeToLive } from '../enums/common.enum';
import { BullModuleOptions } from '@nestjs/bull';

@Injectable()
export class ConfigServiceProvider {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: parseInt(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      schema: 'dbo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: false,
      options: { encrypt: false },
      requestTimeout: 30000
    };
  }

  createMssqlOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      schema: 'dbo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: false,
      // logging: true,
      options: { encrypt: false },
      requestTimeout: 30000
    };
  }

  createJwtOptions(): JwtModuleOptions {
    return {};
  }

  createBullOptions(): BullModuleOptions {
    return {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB),
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    };
  }

  async createRedisOptions(): Promise<any> {
    return {
      store: redisStore,
      url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`,
      ttl: TimeToLive.HaftHour,
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
          sessionTimeout: 300 * 1000,
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

  minioConfig(){
    return {
      endPoint: process.env.MINIO_ENDPOINT,
      port: +process.env.MINIO_PORT,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    }
  }
}
