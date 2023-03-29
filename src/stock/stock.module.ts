import {Module} from '@nestjs/common';
import {StockService} from './stock.service';
import {StockController} from './stock.controller';
import {ChartController} from "./chart.controller";
import {ChartService} from "./chart.service";

@Module({
    controllers: [StockController, ChartController],
    providers: [StockService, ChartService],
})
export class StockModule {
}
