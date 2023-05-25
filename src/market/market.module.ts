import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { CashFlowService } from '../stock/cash-flow.service';
import { StockService } from '../stock/stock.service';
import { MssqlService } from '../mssql/mssql.service';

@Module({
  controllers: [MarketController],
  providers: [MarketService, CashFlowService, StockService, MssqlService],
})
export class MarketModule {}
