import {Controller, Get, HttpStatus, Query, Res} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MarketBreadthSwagger } from '../responses/MarketBreadth.response';
import { MarketVolatilitySwagger } from '../responses/MarketVolatiliy.response';
import { BaseResponse } from '../utils/utils.response';
import { StockService } from './stock.service';
import {GetPageLimitStockDto} from "./dto/getPageLimitStock.dto";
import {NetTransactionValueResponse} from "../responses/NetTransactionValue.response";

@Controller('stock')
@ApiTags('Stock - Api')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('market-volatility')
  @ApiOperation({ summary: 'Danh sách biến động thị trường' })
  @ApiOkResponse({ type: MarketVolatilitySwagger })
  async getMarketVolatility(@Res() res: Response) {
    const data = await this.stockService.getMarketVolatility();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('market-liquidity')
  @ApiOperation({ summary: 'Thanh khoản thị trường' })
  // @ApiOkResponse({type: MarketVolatilitySwagger})
  async getMarketLiquidity(@Res() res: Response) {
    const data = await this.stockService.getMarketLiquidity();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('market-breadth')
  @ApiOperation({ summary: 'Độ rộng ngành' })
  @ApiOkResponse({ type: MarketBreadthSwagger })
  async getMarketBreadth(@Res() res: Response) {
    const data = await this.stockService.getMarketBreadth();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('net-transaction-value')
  @ApiOperation({ summary: 'Giá trị giao dịch ròng' })
  @ApiOkResponse({ type: NetTransactionValueResponse })
  async getNetTransactionValue(@Query() q: GetPageLimitStockDto, @Res() res: Response) {
    const data = await this.stockService.getNetTransactionValue(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
