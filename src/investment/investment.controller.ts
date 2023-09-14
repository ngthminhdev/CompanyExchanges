import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { InvestmentService } from './investment.service';

@Controller('investment')
@ApiTags('Investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('filter')
  @ApiOperation({summary: 'Lọc tiêu chí'})
  async filter(@Body() b: InvestmentFilterDto, @Res() res: Response) {
    const data = await this.investmentService.filter(b);
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }
}
