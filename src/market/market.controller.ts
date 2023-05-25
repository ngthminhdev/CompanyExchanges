import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { IndustryFilterDto } from './dto/industry-filter.dto';
import { MarketService } from './market.service';
import { PriceChangePerformanceSwagger } from './responses/price-change-performance.response';
import { LiquidityChangePerformanceSwagger } from './responses/liquidity-change-performance.response';
import { MarketTimeQueryDto } from './dto/market-time-query.dto';
import { IndusLiquiditySwagger } from './responses/indus-liquidity.response';

@ApiTags('Thi Truong - API')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('hieu-suat-thay-doi-gia-co-phieu')
  @ApiOperation({
    summary: 'Hiệu suất giá thay đổi giá các cổ phiếu',
  })
  @ApiOkResponse({ type: PriceChangePerformanceSwagger })
  async priceChangePerformance(
    @Query() q: IndustryFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.priceChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-thanh-khoan-co-phieu')
  @ApiOperation({
    summary: 'Hiệu suất giá tăng trưởng thanh khoản các cổ phiếu',
  })
  @ApiOkResponse({ type: LiquidityChangePerformanceSwagger })
  async liquidityChangePerformance(
    @Query() q: IndustryFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.liquidityChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-thay-doi-von-hoa-nganh')
  @ApiOperation({
    summary: 'Hiệu suất thay đổi vốn hóa (ROC) của các ngành',
  })
  @ApiOkResponse({ type: LiquidityChangePerformanceSwagger })
  async marketCapChangePerformance(
    @Query() q: MarketTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.marketCapChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
      parseInt(q.type),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-thay-doi-thanh-khoan-nganh')
  @ApiOperation({
    summary: 'Tăng trưởng thanh khoản các ngành',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async indsLiquidityChangePerformance(
    @Query() q: MarketTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.indsLiquidityChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
