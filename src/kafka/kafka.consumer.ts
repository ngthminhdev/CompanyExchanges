import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload
} from '@nestjs/microservices';
import { KAFKA_MODULE } from '../constants';
import { requestPatterns, Topics } from '../enums/kafka-topics.enum';
import { ChartNenInterface } from './interfaces/chart-nen.interface';
import { DomesticIndexKafkaInterface } from './interfaces/domestic-index-kafka.interface';
import { ForeignKafkaInterface } from './interfaces/foreign-kafka.interface';
import { IndustryKafkaInterface } from './interfaces/industry-kafka.interface';
import { LineChartInterfaceV2 } from './interfaces/line-chart.interface';
import { MarketBreadthKafkaInterface } from './interfaces/market-breadth-kafka.interface';
import { MarketCashFlowInterface } from './interfaces/market-cash-flow.interface';
import { MarketLiquidityKafkaInterface } from './interfaces/market-liquidity-kakfa.interface';
import { TickerChangeInterface } from './interfaces/ticker-change.interface';
import { TickerContributeKafkaInterface } from './interfaces/ticker-contribute-kafka.interface';
import { KafkaService } from './kafka.service';

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
      console.log(patterns);
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
    @Payload() payload: MarketBreadthKafkaInterface[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleMarketBreadth(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.DoRongThiTruongHNX)
  handleMarketBreadthHNX(
    @Payload() payload: MarketBreadthKafkaInterface[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleMarketBreadthHNX(payload);
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
      this.kafkaService.handleMarketLiquidityNow(payload);
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
      this.kafkaService.handleIndustry();
    } catch (error) {
      console.log('loi phan nganh');
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
      this.kafkaService.handleMarketVolatility(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.LineChart)
  handleLineChart(
    @Payload() payload: LineChartInterfaceV2[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleLineChart(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.StockValue)
  handleStockValue(
    @Payload() payload: MarketCashFlowInterface[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleStockValue(payload);
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
        // this.kafkaService.handleIndustryByEx(payload),
      ]);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.Foreign)
  handleForeign(
    @Payload() payload: ForeignKafkaInterface[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleForeign(payload);
      this.kafkaService.handleTopForeign(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.ChiSoTrongNuoc2)
  handleDomesticIndex2(
    @Payload() payload: LineChartInterfaceV2[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleDomesticIndex2(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.CoPhieuAnhHuong)
  async handleTickerContribute(
    @Payload() payload: TickerContributeKafkaInterface[],
    @Ctx() context: KafkaContext,
  ) {
    try {
      this.kafkaService.handleTickerContribute(payload);
    } catch (error) {
      this.logger.error(error);
    }
  }

  @MessagePattern(Topics.ChartNenCoPhieu)
  async handleChartNen(@Payload() payload: ChartNenInterface[], @Ctx() context: KafkaContext){
    try {
      this.kafkaService.handleChartNen(payload)
    } catch (error) {
      this.logger.error(error)
    }
  }
}
