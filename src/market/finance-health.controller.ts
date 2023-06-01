import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { MarketTimeQueryDto } from './dto/market-time-query.dto';
import { FinanceHealthService } from './finance-health.service';
import { IndusValueSwagger } from './responses/indus-value.response';

@ApiTags('Sức khỏe tài chính - API')
@Controller('finance-health')
export class FinanceHealthController {
  constructor(private readonly fHealthService: FinanceHealthService) {}

  @Get('p-e-binh-quan-nganh')
  @ApiOperation({
    summary: 'Diễn biến P/E bình quân các nhóm ngành  (lần)',
  })
  @ApiOkResponse({ type: IndusValueSwagger })
  async PEIndustry(@Query() q: MarketTimeQueryDto, @Res() res: Response) {
    const data = await this.fHealthService.PEIndustry(
      q.exchange.toUpperCase(),
      q.industry.split(','),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('p-b-binh-quan-nganh')
  @ApiOperation({
    summary: 'Diễn biến P/B bình quân các nhóm ngành  (lần)',
  })
  @ApiOkResponse({ type: IndusValueSwagger })
  async PBIndustry(@Query() q: MarketTimeQueryDto, @Res() res: Response) {
    const data = await this.fHealthService.PBIndustry(
      q.exchange.toUpperCase(),
      q.industry.split(','),
      parseInt(q.type),
      parseInt(q.order),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
