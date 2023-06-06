import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { CashFlowService } from '../stock/cash-flow.service';
import { StockService } from '../stock/stock.service';
import { MssqlService } from '../mssql/mssql.service';
import { FinanceHealthService } from './finance-health.service';
import { FinanceHealthController } from './finance-health.controller';

@Module({
  controllers: [MarketController, FinanceHealthController],
  providers: [
    MarketService,
    CashFlowService,
    StockService,
    MssqlService,
    FinanceHealthService,
  ],
})
export class MarketModule {}
