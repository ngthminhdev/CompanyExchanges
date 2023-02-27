import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { MarketBreadthSwagger } from '../responses/MarketBreadth.response';
import { MarketVolatilitySwagger } from '../responses/MarketVolatiliy.response';
import { BaseResponse } from '../utils/utils.response';
import { StockService } from './stock.service';

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
}
