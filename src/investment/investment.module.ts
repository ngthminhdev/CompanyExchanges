import { Module } from '@nestjs/common';
import { MssqlService } from '../mssql/mssql.service';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService, MssqlService]
})
export class InvestmentModule {}
