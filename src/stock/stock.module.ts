import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';
import { CashFlowController } from './cash-flow.controller';
import { CashFlowService } from './cash-flow.service';

@Module({
  controllers: [StockController, ChartController, CashFlowController],
  providers: [StockService, ChartService, CashFlowService],
})
export class StockModule {}
