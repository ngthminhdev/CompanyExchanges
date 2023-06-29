import { Module } from '@nestjs/common';
import { RetailService } from './retail.service';
import { RetailController } from './retail.controller';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [RetailController],
  providers: [RetailService, MssqlService]
})
export class RetailModule {}
