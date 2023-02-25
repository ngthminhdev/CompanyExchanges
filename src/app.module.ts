import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModuleModule } from './config-module/config-module.module';
import { ConfigServiceProvider } from './config-module/config-module.service';
import { CityEntity } from './models/city.entity';
import { DistrictEntity } from './models/district.entity';
import { WardEntity } from './models/ward.entity';
import { StockModule } from './stock/stock.module';
import { UserModule } from './user/user.module';

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
      useFactory: async (config: ConfigServiceProvider) => {return await config.createRedisOptions()} , isGlobal: true,
      inject: [ConfigServiceProvider],
    }),

    //aplication modules
    ConfigModuleModule,
    StockModule,
    AuthModule,
    UserModule,
  ]
})
export class AppModule {}
