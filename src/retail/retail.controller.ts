import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { RetailValueDto } from './dto/retail-value.dto';
import { RetailValueSwagger } from './responses/retail-value.response';
import { RetailService } from './retail.service';

@Controller('retail')
@ApiTags('Retail')
export class RetailController {
  constructor(private readonly retailService: RetailService) {}

  @Get('ban-le-theo-nganh')
  @ApiOperation({
    summary: 'Giá trị bán lẻ theo các lĩnh vực (Tỷ VNĐ)',
  })
  @ApiResponse({type: RetailValueSwagger, status: HttpStatus.OK})
  async retailValue(@Query() q: RetailValueDto, @Res() res: Response) {
    try {
      const data = await this.retailService.retailValue(parseInt(q.order));
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }
}
