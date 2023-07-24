import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService, MssqlService]
})
export class ReportModule {}
