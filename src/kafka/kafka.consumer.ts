import {Controller, Inject, Logger} from '@nestjs/common';
import {ClientKafka, Ctx, KafkaContext, MessagePattern, Payload,} from '@nestjs/microservices';
import {KafkaService} from './kafka.service';
import {KAFKA_MODULE} from '../constants';
import {requestPatterns, Topics} from '../enums/kafka-topics.enum';
import {MarketBreadthKafkaInterface} from "./interfaces/market-breadth-kafka.interface";
import {MarketLiquidityKafkaInterface} from "./interfaces/market-liquidity-kakfa.interface";
import {IndustryKafkaInterface} from "./interfaces/industry-kafka.interface";
import {DomesticIndexKafkaInterface} from "./interfaces/domestic-index-kafka.interface";
import {TickerChangeInterface} from "./interfaces/ticker-change.interface";

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

  @MessagePattern(Topics.ThanhKhoanPhienHienTai)
  handleMarketLiquidityNow(
      @Payload() payload: MarketLiquidityKafkaInterface,
      @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleMarketLiquidityNow(payload)
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.PhanNganh)
  handleIndustry(
      @Payload() payload: IndustryKafkaInterface[],
      @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleIndustry(payload)
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.ChiSoTrongNuoc)
  handleDomesticIndex(
      @Payload() payload: DomesticIndexKafkaInterface[],
      @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleDomesticIndex(payload);
      this.kafkaService.handleMarketVolatility(payload)
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.TickerChange)
  async HandleTickerChange(
      @Payload() payload: TickerChangeInterface[],
      @Ctx() context: KafkaContext,
  ) {
    try {
      await Promise.all([
        this.kafkaService.handleTopRocHNX(payload),
        this.kafkaService.handleTopRocHSX(payload),
        this.kafkaService.handleTopRocUPCOM(payload),
      ])
    } catch (error) {
      this.logger.error(error);
    }
  }
}
