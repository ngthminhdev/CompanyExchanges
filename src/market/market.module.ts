import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { CashFlowService } from '../stock/cash-flow.service';
import { StockService } from '../stock/stock.service';

@Module({
  controllers: [MarketController],
  providers: [MarketService, CashFlowService, StockService],
})
export class MarketModule {}
