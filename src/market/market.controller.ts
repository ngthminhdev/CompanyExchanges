import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { IndustryFilterDto } from './dto/industry-filter.dto';
import { MarketTimeQueryDto } from './dto/market-time-query.dto';
import { MarketService } from './market.service';
import { EquityChangeSwagger } from './responses/equity-change.response';
import { IndusLiquiditySwagger } from './responses/indus-liquidity.response';
import { LiabilitiesChangeSwagger } from './responses/liabilities-change.response';
import { LiquidityChangePerformanceSwagger } from './responses/liquidity-change-performance.response';
import { PriceChangePerformanceSwagger } from './responses/price-change-performance.response';
import { TimeFrameDto } from './dto/time-frame.dto';

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
    @Query() q: TimeFrameDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.marketCapChangePerformance(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-thay-doi-thanh-khoan-nganh')
  @ApiOperation({
    summary: 'Tăng trưởng thanh khoản các ngành',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async indsLiquidityChangePerformance(
    @Query() q: TimeFrameDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.indsLiquidityChangePerformance(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-von-chu-so-huu-nganh')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng vốn chủ sở hữu của các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async equityIndsChangePerformance(
    @Query() q: TimeFrameDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.equityIndsChangePerformance(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-von-chu-so-co-phieu')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng vốn chủ sở hữu của các cổ phiếu (%)',
  })
  @ApiOkResponse({ type: EquityChangeSwagger })
  async equityChangePerformance(
    @Query() q: IndustryFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.equityChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-no-phai-tra-nganh')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng nợ phải trả của các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async liabilitiesIndsChangePerformance(
    @Query() q: TimeFrameDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.liabilitiesIndsChangePerformance(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-no-phai-tra-co-phieu')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng vốn chủ sở hữu của các cổ phiếu (%)',
  })
  @ApiOkResponse({ type: LiabilitiesChangeSwagger })
  async liabilitiesChangePerformance(
    @Query() q: IndustryFilterDto,
    @Res() res: Response,
  ) {
    const data = await this.marketService.liabilitiesChangePerformance(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-doanh-thu-thuan-nganh')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng doanh thu thuần của các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async netRevenueInds(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.netRevenueInds(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-loi-nhuan-gop-nganh')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng lợi nhuân gộp các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async profitInds(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.profitInds(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-loi-nhuan-kinh-doanh-nganh')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng lợi nhuận hoạt động các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async activityProfitInds(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.activityProfitInds(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-eps')
  @ApiOperation({
    summary: 'Hiệu suất tăng trưởng EPS các ngành (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async epsInds(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.epsInds(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-ebitda')
  @ApiOperation({
    summary: 'Tăng trưởng EBITDA của các ngành qua từng kỳ (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async ebitdaInds(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.ebitdaInds(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('hieu-suat-tang-truong-co-tuc-tien-mat')
  @ApiOperation({
    summary: 'Tăng trưởng cổ tức tiền mặt của các ngành qua từng kỳ (%)',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async cashDividend(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.marketService.cashDividend(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-nganh-hot')
  @ApiOperation({
    summary: 'top-nganh-hot',
  })
  @ApiOkResponse({ type: IndusLiquiditySwagger })
  async topHotIndustry(@Res() res: Response) {
    const data = await this.marketService.topHotIndustry();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
