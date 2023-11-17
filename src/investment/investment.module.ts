import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DB_SERVER } from '../constants';
import { MssqlService } from '../mssql/mssql.service';
import { FilterUserEntity } from './entities/filter.entity';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

@Module({
  imports: [TypeOrmModule.forFeature([FilterUserEntity], DB_SERVER)],
  controllers: [InvestmentController],
  providers: [InvestmentService, MssqlService, JwtService]
})
export class InvestmentModule {}
