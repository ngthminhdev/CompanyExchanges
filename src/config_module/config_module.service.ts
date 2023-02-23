import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';

@Injectable()
export class ConfigServiceProvider {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mssql',
      host: process.env.MSSQL_HOST,
      port: parseInt(process.env.MSSQL_PORT),
      username: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      database: process.env.MSSQL_DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      options: { encrypt: false },
      synchronize: true,
      // logging: true,
    };
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      secretOrPrivateKey: process.env.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: parseInt(process.env.EXPIRE_TIME),
      },
    };
  }
}
