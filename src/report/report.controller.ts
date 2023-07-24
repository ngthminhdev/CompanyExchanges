import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { ReportService } from './report.service';
import { ReportIndexResponse } from './response/index.response';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({summary: 'Chỉ số'})
  @ApiOkResponse({status: HttpStatus.OK, type: ReportIndexResponse})
  @Get('chi-so')
  async getIndex(@Res() res: Response) {
    try {
      const data = await this.reportService.getIndex();
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }
}
