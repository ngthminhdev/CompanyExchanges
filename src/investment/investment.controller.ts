import { Body, Controller, Get, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { EmulatorInvestmentDto } from './dto/emulator.dto';
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
    try {
      const data = await this.investmentService.filter(b);
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)        
    }
  }

  @Get('key-filter')
  @ApiOperation({summary: 'Lấy max min từng tiêu chí'})
  @ApiOkResponse({type: KeyFilterResponse, isArray: true})
  async keyFilter(@Res() res: Response){
    try {
      const data = await this.investmentService.keyFilter()
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Post('emulator')
  @ApiOperation({summary: 'Giả lập đầu tư'})
  async emulatorInvestment(@Body() b: EmulatorInvestmentDto, @Res() res: Response){
    try {
      const data = await this.investmentService.emulatorInvestment(b)
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('search')
  @ApiOperation({summary: 'Tìm cổ phiếu'})
  async search(@Query() q: {stock: string}, @Res() res: Response){
    try {
      const data = await this.investmentService.search(q.stock.toUpperCase())
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (e) {
      throw new CatchException(e)
    }
  }
}
