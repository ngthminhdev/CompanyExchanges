import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { DeviceGuard } from '../guards/device.guard';
import { StockDto } from '../shares/dto/stock.dto';
import { GetUserIdFromToken } from '../utils/utils.decorators';
import { BaseResponse } from '../utils/utils.response';
import { EmulatorInvestmentDto } from './dto/emulator.dto';
import { InvestmentFilterDto } from './dto/investment-filter.dto';
import { IdParamDto } from './dto/paramId.dto';
import { SaveFilterDto } from './dto/save-filter.dto';
import { InvestmentService } from './investment.service';
import { InvestmentFilterResponseSwagger } from './response/investmentFilter.response';
import { KeyFilterResponse } from './response/keyFilter.response';

@Controller('investment')
@ApiTags('Investment - Công cụ đầu tư')
export class InvestmentController {
  constructor(
    private readonly investmentService: InvestmentService,
    ) {}


  /**
   * Công cụ đầu tư
   */  
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

  @UseGuards(DeviceGuard)
  @Post('save-filter')
  @ApiOperation({summary: 'Lưu bộ lọc'})
  async saveFilter(@GetUserIdFromToken() user_id: number, @Body() b: SaveFilterDto, @Res() res: Response){
    const data = await this.investmentService.saveFilter(user_id, b)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @UseGuards(DeviceGuard)
  @Get('your-filter')
  @ApiOperation({summary: 'Lấy bộ lọc'})
  async getFilter(@GetUserIdFromToken() user_id: number, @Res() res: Response){
    const data = await this.investmentService.getFilterUser(user_id)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @UseGuards(DeviceGuard)
  @Post('update-filter/:id')
  @ApiOperation({summary: 'Chỉnh sửa bộ lọc'})
  async updateFilter(@GetUserIdFromToken() user_id: number, @Param() p: IdParamDto, @Body() b: SaveFilterDto, @Res() res: Response){
    const data = await this.investmentService.updateFilter(+p.id, user_id, b)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @UseGuards(DeviceGuard)
  @Post('delete-filter/:id')
  @ApiOperation({summary: 'Xoá bộ lọc'})
  async deleteFilter(@GetUserIdFromToken() user_id: number, @Param() p: IdParamDto, @Res() res: Response){
    const data = await this.investmentService.deleteFilter(+p.id, user_id)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }


  /**
   * Giả lập đầu tư
   */

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
  async search(@Query() q: StockDto, @Res() res: Response){
    try {
      const data = await this.investmentService.search(q.stock.toUpperCase())
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (e) {
      throw new CatchException(e)
    }
  }
}
