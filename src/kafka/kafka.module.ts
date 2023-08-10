import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaConsumer } from './kafka.consumer';
import { StockService } from '../stock/stock.service';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [KafkaConsumer],
  providers: [KafkaService, StockService, MssqlService],
})
export class KafkaModule {}
