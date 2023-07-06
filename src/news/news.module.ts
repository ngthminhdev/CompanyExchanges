import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, MssqlService]
})
export class NewsModule {}
