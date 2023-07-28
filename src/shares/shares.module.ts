import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [SharesController],
  providers: [SharesService, MssqlService]
})
export class SharesModule {}
