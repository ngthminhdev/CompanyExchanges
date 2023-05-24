import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { IndustryFilterDto } from './dto/industry-filter.dto';
import { MarketService } from './market.service';
import { PriceChangePerformanceSwagger } from './responses/price-change-performance.response';

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

  @Get('hieu-suat-tang-trung-thanh-khoan-co-phieu')
  @ApiOperation({
    summary: 'Hiệu suất giá tăng trưởng thanh khoản các cổ phiếu',
  })
  @ApiOkResponse({ type: PriceChangePerformanceSwagger })
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
}
