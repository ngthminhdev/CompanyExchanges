import { Module } from '@nestjs/common';
import { MssqlService } from './mssql.service';

@Module({
  providers: [MssqlService],
})
export class MssqlModule {}
