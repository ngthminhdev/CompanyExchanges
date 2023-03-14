import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KAFKA_MODULE } from '../constants';
import { requestPatterns, Topics } from '../enums/kafka-topics.enum';
import {MarketBreadthKafkaInterface} from "./interfaces/market-breadth-kafka.interface";

@Controller()
export class KafkaConsumer {
  private logger = new Logger(KafkaConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    @Inject(KAFKA_MODULE) private readonly client: ClientKafka,
  ) {}

  send<T>(key: string, message: T): void {
    this.client.emit(key, JSON.stringify(message));
  }

  async onModuleInit() {
    try {
      console.log(process.env.NODE_ENV);
      const patterns =
        process.env.NODE_ENV !== 'production' ? [] : requestPatterns;
      console.log(patterns)
      this.listenRequestPatterns(patterns);
      await this.client.connect();
    } catch (error) {
      this.logger.error(error);
    }
  }

  listenRequestPatterns(requestPatterns: string[]) {
    requestPatterns.forEach((pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
  }

  @MessagePattern(Topics.DoRongThiTruong)
  handleMarketBreadth(
    @Payload() payload: MarketBreadthKafkaInterface,
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleMarketBreadth(payload)
    } catch (error) {
      this.logger.error(error);
    }
  }
}
