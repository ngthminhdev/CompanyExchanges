import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MssqlService } from '../mssql/mssql.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { MinioOptionModule } from '../minio/minio.module';
import { StockService } from '../stock/stock.service';

@Module({
  imports: [NestjsFormDataModule, MinioOptionModule],
  controllers: [ReportController],
  providers: [ReportService, MssqlService, StockService]
})
export class ReportModule {}
