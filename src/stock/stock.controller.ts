import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { GetExchangeQuery } from './dto/getExchangeQuery.dto';
import { GetLiquidityQueryDto } from './dto/getLiquidityQuery.dto';
import { GetMarketMapQueryDto } from './dto/getMarketMapQuery.dto';
import { IndexQueryDto } from './dto/indexQuery.dto';
import { MarketLiquidityQueryDto } from './dto/marketLiquidityQuery.dto';
import { MerchandisePriceQueryDto } from './dto/merchandisePriceQuery.dto';
import { NetForeignQueryDto } from './dto/netForeignQuery.dto';
import { DomesticIndexSwagger } from './responses/DomesticIndex.response';
import { IndustrySwagger } from './responses/Industry.response';
import { InternationalIndexSwagger } from './responses/InternationalIndex.response';
import { LiquidContributeSwagger } from './responses/LiquidityContribute.response';
import { MarketEvaluationSwagger } from './responses/MarketEvaluation.response';
import { MarketLiquiditySwagger } from './responses/MarketLiquidity.response';
import { MarketVolatilitySwagger } from './responses/MarketVolatiliy.response';
import { MerchandisePriceSwagger } from './responses/MerchandisePrice.response';
import { NetForeignSwagger } from './responses/NetForeign.response';
import { NetTransactionValueResponse } from './responses/NetTransactionValue.response';
import { StockEventsSwagger } from './responses/StockEvents.response';
import { StockNewsSwagger } from './responses/StockNews.response';
import { TopNetForeignSwagger } from './responses/TopNetForeign.response';
import { TopNetForeignByExsSwagger } from './responses/TopNetForeignByEx.response';
import { TopRocSwagger } from './responses/TopRoc.response';
import { UpDownTickerSwagger } from './responses/UpDownTicker.response';
import { MarketMapSwagger } from './responses/market-map.response';
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
  @ApiOkResponse({ type: MarketLiquiditySwagger })
  async getMarketLiquidity(
    @Query() q: MarketLiquidityQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.stockService.getMarketLiquidity(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('industry')
  @ApiOperation({ summary: 'Phân ngành', description: 'HSX, HNX, UPCOM, ALL' })
  @ApiOkResponse({ type: IndustrySwagger })
  async getIndustry(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getIndustry(q.exchange.toUpperCase());
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('net-transaction-value')
  @ApiOperation({
    summary: 'Giá trị giao dịch ròng',
    description: 'VN30, HNX30, UPINDEX, VNINDEX',
  })
  @ApiOkResponse({ type: NetTransactionValueResponse })
  async getNetTransactionValue(
    @Query() q: GetExchangeQuery,
    @Res() res: Response,
  ) {
    const data = await this.stockService.getNetTransactionValue(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-news')
  @ApiOperation({ summary: 'Tin tức thị trường chứng khoán' })
  @ApiOkResponse({ type: StockNewsSwagger })
  async getNews(@Res() res: Response) {
    const data = await this.stockService.getNews();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-macro-news')
  @ApiOperation({ summary: 'Tin tức thị trường vĩ mô' })
  @ApiOkResponse({ type: StockNewsSwagger })
  async getMacroNews(@Res() res: Response) {
    const data = await this.stockService.getMacroNews();
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
  @ApiOperation({
    summary: 'Top mua bán ròng ngoại khối',
    description: 'HOSE, HNX,, UPCOM',
  })
  @ApiOkResponse({ type: TopNetForeignSwagger })
  async getTopNetForeign(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getTopNetForeign(
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('net-foreign')
  @ApiOperation({
    summary: 'Tổng hợp mua bán ròng ngoại khối',
    description: 'HSX, HNX, UPCOM',
  })
  @ApiOkResponse({ type: NetForeignSwagger })
  async getNetForeign(@Query() q: NetForeignQueryDto, @Res() res: Response) {
    const data = await this.stockService.getNetForeign(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-roc')
  @ApiOperation({
    summary: 'Top thay đổi ROC 5 phiên',
    description: 'HOSE, VN30, HNX, HNX30, UPCOM',
  })
  @ApiOkResponse({ type: TopRocSwagger })
  async getTopROC(@Query() q: GetExchangeQuery, @Res() res: Response) {
    const data = await this.stockService.getTopROC(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-net-foreign-change')
  @ApiOperation({
    summary: 'Top thay đổi ROC 5 phiên',
    description: 'HSX, HNX, UPCOM',
  })
  @ApiOkResponse({ type: TopNetForeignByExsSwagger })
  async getTopNetForeignChangeByExchange(
    @Query() q: GetExchangeQuery,
    @Res() res: Response,
  ) {
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

  @Get('merchandise-price')
  @ApiOperation({
    summary: 'Giá hàng hóa',
  })
  @ApiOkResponse({ type: MerchandisePriceSwagger })
  async getMerchandisePrice(
    @Query() q: MerchandisePriceQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.stockService.getMerchandisePrice(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('market-evaluation')
  @ApiOperation({
    summary: 'Đánh giá thị trường',
  })
  @ApiOkResponse({ type: MarketEvaluationSwagger })
  async marketEvaluation(@Res() res: Response) {
    const data = await this.stockService.marketEvaluation();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('liquidity-contribute')
  @ApiOperation({
    summary: 'Đóng góp thanh khoản',
    description: 'ALL, HSX, HNX, UPCOM',
  })
  @ApiOkResponse({ type: LiquidContributeSwagger })
  async getLiquidityContribute(
    @Query() q: GetLiquidityQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.stockService.getLiquidityContribute(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('get-market-map')
  @ApiOperation({
    summary: 'Bản đồ thị trường',
  })
  @ApiOkResponse({
    type: MarketMapSwagger,
    description: 'ALL, HSX, HNX, UPCOM',
  })
  async getMarketMap(@Query() q: GetMarketMapQueryDto, @Res() res: Response) {
    const data = await this.stockService.getMarketMap(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('bien-dong-thi-truong')
  @ApiOperation({
    summary: 'Biến động thị trường (tăng, giảm, trần, sàn)',
  })
  @ApiOkResponse({
    type: UpDownTickerSwagger,
    description: 'VNINDEX, VN30, VNXALL, HNXINDEX, HNX30 , UPINDEX',
  })
  async getUpDownTicker(@Query() q: IndexQueryDto, @Res() res: Response) {
    const data = await this.stockService.getUpDownTicker(q.index.toUpperCase());
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
