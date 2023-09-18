import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { InvestmentService } from './investment.service';
import { InvestmentFilterResponseSwagger } from './response/investmentFilter.response';
import { KeyFilterResponse } from './response/keyFilter.response';

@Controller('investment')
@ApiTags('Investment - Công cụ đầu tư')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post('filter')
  @ApiOperation({summary: 'Lọc tiêu chí'})
  @ApiOkResponse({type: InvestmentFilterResponseSwagger})
  async filter(@Body() b: InvestmentFilterDto, @Res() res: Response) {
    const data = await this.investmentService.filter(b);
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @Get('key-filter')
  @ApiOperation({summary: 'Lấy max min từng tiêu chí'})
  @ApiOkResponse({type: KeyFilterResponse, isArray: true})
  async keyFilter(@Res() res: Response){
    const data = await this.investmentService.keyFilter()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }
}
