import {Controller, Get, HttpStatus, Query, Res} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';
import {MarketBreadthSwagger} from './responses/MarketBreadth.response';
import {MarketVolatilitySwagger} from './responses/MarketVolatiliy.response';
import {BaseResponse} from '../utils/utils.response';
import {StockService} from './stock.service';
import {GetExchangeQuery} from "./dto/getExchangeQuery.dto";
import {NetTransactionValueResponse} from "./responses/NetTransactionValue.response";
import {MarketLiquiditySwagger} from "./responses/MarketLiquidity.response";
import {MarketLiquidityQueryDto} from "./dto/marketLiquidityQuery.dto";
import {StockNewsSwagger} from "./responses/StockNews.response";
import {DomesticIndexSwagger} from "./responses/DomesticIndex.response";
import {TopNetForeignSwagger} from "./responses/TopNetForeign.response";
import {NetForeignSwagger} from "./responses/NetForeign.response";
import {NetForeignQueryDto} from "./dto/netForeignQuery.dto";
import {TopRocSwagger} from "./responses/TopRoc.response";
import {TopNetForeignByExsSwagger} from "./responses/TopNetForeignByEx.response";
import {InternationalIndexSwagger} from "./responses/InternationalIndex.response";
import {StockEventsSwagger} from "./responses/StockEvents.response";

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
  @ApiOperation({
      summary: 'Giá trị giao dịch ròng',
      description: 'VN30, HNX30, UPINDEX, VNINDEX'
  })
  @ApiOkResponse({ type: NetTransactionValueResponse })
  async getNetTransactionValue(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getNetTransactionValue(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-news')
  @ApiOperation({ summary: 'Tin tức thị trường chứng' })
  @ApiOkResponse({ type: StockNewsSwagger })
  async getNews(@Res() res: Response) {
    const data = await this.stockService.getNews();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-events')
  @ApiOperation({ summary: 'Sự kiện thị trường chứng' })
  @ApiOkResponse({ type: StockEventsSwagger })
  async getStockEvents(@Res() res: Response) {
    const data = await this.stockService.getStockEvents();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('domestic-index')
  @ApiOperation({ summary: 'Chỉ số trong nước' })
  @ApiOkResponse({ type: DomesticIndexSwagger })
  async getDomesticIndex(@Res() res: Response) {
    const data = await this.stockService.getDomesticIndex();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-net-foreign')
  @ApiOperation({ summary: 'Top mua bán ròng ngoại khối' })
  @ApiOkResponse({ type: TopNetForeignSwagger })
  async getTopNetForeign(@Res() res: Response) {
    const data = await this.stockService.getTopNetForeign();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('net-foreign')
  @ApiOperation({
    summary: 'Tổng hợp mua bán ròng ngoại khối',
    description: 'HSX, HNX, UPCOM'
  })
  @ApiOkResponse({ type: NetForeignSwagger })
  async getNetForeign(@Query() q: NetForeignQueryDto, @Res() res: Response) {
    const data = await this.stockService.getNetForeign(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-roc')
  @ApiOperation({
      summary: 'Top thay đổi ROC 5 phiên',
      description: 'HOSE, VN30, HNX, HNX30, UPCOM'
  })
  @ApiOkResponse({ type: TopRocSwagger })
  async getTopROC(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getTopROC(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-net-foreign-change')
  @ApiOperation({
    summary: 'Top thay đổi ROC 5 phiên',
    description: 'HSX, HNX, UPCOM'
  })
  @ApiOkResponse({ type: TopNetForeignByExsSwagger })
  async getTopNetForeignChangeByExchange(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getTopNetForeignChangeByExchange(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('international-index')
  @ApiOperation({
    summary: 'Chỉ số quốc tế',
  })
  @ApiOkResponse({ type: InternationalIndexSwagger })
  async getMaterialPrice(@Res() res: Response) {
    const data = await this.stockService.getMaterialPrice();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
