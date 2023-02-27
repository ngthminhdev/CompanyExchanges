import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaConsumer } from './kafka.consumer';

@Module({
  controllers: [KafkaConsumer],
  providers: [KafkaService],
})
export class KafkaModule {}
