import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { MarketTimeQueryDto } from './dto/market-time-query.dto';
import { FinanceHealthService } from './finance-health.service';
import { IndusValueSwagger } from './responses/indus-value.response';
import { IndustryFilterDto } from './dto/industry-filter.dto';
import { PEBSwagger } from './responses/peb-ticker.response';
import { TimeFrameDto } from './dto/time-frame.dto';

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
}
