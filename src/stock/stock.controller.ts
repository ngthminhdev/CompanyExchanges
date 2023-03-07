import {Controller, Get, HttpStatus, Query, Res} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';
import {MarketBreadthSwagger} from '../responses/MarketBreadth.response';
import {MarketVolatilitySwagger} from '../responses/MarketVolatiliy.response';
import {BaseResponse} from '../utils/utils.response';
import {StockService} from './stock.service';
import {GetExchangeQuery} from "./dto/getExchangeQuery.dto";
import {NetTransactionValueResponse} from "../responses/NetTransactionValue.response";
import {MarketLiquiditySwagger} from "../responses/MarketLiquidity.response";
import {MarketLiquidityQueryDto} from "./dto/marketLiquidityQuery.dto";
import {StockNewsSwagger} from "../responses/StockNews.response";

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
  @ApiOkResponse({type: MarketLiquiditySwagger})
  async getMarketLiquidity(@Query() q: MarketLiquidityQueryDto,  @Res() res: Response) {
    const data = await this.stockService.getMarketLiquidity(q);
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
  async getNetTransactionValue(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getNetTransactionValue(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-news')
  @ApiOperation({ summary: 'Tin tức thị trường chứng ' })
  @ApiOkResponse({ type: StockNewsSwagger })
  async getNews(@Res() res: Response) {
    const data = await this.stockService.getNews();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
