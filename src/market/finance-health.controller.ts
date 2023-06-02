import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { ExchangeOrderDto } from './dto/ex-order.dto';
import { IndustryFilterDto } from './dto/industry-filter.dto';
import { TimeFrameDto } from './dto/time-frame.dto';
import { FinanceHealthService } from './finance-health.service';
import { IndusValueSwagger } from './responses/indus-value.response';
import { PEBSwagger } from './responses/peb-ticker.response';

@ApiTags('Sức khỏe tài chính - API')
@Controller('finance-health')
export class FinanceHealthController {
  constructor(private readonly fHealthService: FinanceHealthService) {}

  @Get('p-e-p-b-binh-quan-nganh')
  @ApiOperation({
    summary: 'Diễn biến P/E, P/B bình quân các nhóm ngành (lần)',
  })
  @ApiOkResponse({ type: IndusValueSwagger })
  async PEPBIndustry(@Query() q: TimeFrameDto, @Res() res: Response) {
    const data = await this.fHealthService.PEPBIndustry(
      q.exchange.toUpperCase(),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('p-e-binh-quan-co-phieu')
  @ApiOperation({
    summary: 'Diễn biến P/E bình quân các co phieu',
  })
  @ApiOkResponse({ type: PEBSwagger })
  async PETicker(@Query() q: IndustryFilterDto, @Res() res: Response) {
    const data = await this.fHealthService.PETicker(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('p-b-binh-quan-co-phieu')
  @ApiOperation({
    summary: 'Diễn biến P/B bình quân các co phieu',
  })
  @ApiOkResponse({ type: PEBSwagger })
  async PBTicker(@Query() q: IndustryFilterDto, @Res() res: Response) {
    const data = await this.fHealthService.PBTicker(
      q.exchange.toUpperCase(),
      q.industry.split(','),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ty-so-thanh-toan')
  @ApiOperation({
    summary: `
      Tỷ số thanh toán hiện hành (Lần),
      Tỷ số thanh toán nhanh (Lần),
      Tỷ số thanh toán tiền mặt (Lần)
    `,
  })
  @ApiOkResponse({ type: PEBSwagger })
  async payoutRatio(@Query() q: ExchangeOrderDto, @Res() res: Response) {
    const data = await this.fHealthService.payoutRatio(
      q.exchange.toUpperCase(),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
