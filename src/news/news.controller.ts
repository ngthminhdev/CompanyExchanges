import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { GetExchangeQuery } from '../stock/dto/getExchangeQuery.dto';
import { BaseResponse } from '../utils/utils.response';
import { NewsService } from './news.service';
import { NewsEventResponse } from './response/event.response';
import { NewsEnterpriseResponse } from './response/news-enterprise.response';

@Controller('news')
@ApiTags('Trung tâm tin tức')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @ApiOperation({summary: 'Tin doanh nghiệp - Lịch sự kiện'})
  @ApiOkResponse({type: NewsEventResponse})
  @Get('event')
  async event(@Query() q: GetExchangeQuery,@Res() res: Response){
    try {
      const data = await this.newsService.getEvent(q.exchange)
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @ApiOperation({summary: 'Tin doanh nghiệp - Tin tức doanh nghiệp'})
  @ApiOkResponse({type: NewsEnterpriseResponse})
  @Get('tin-tuc-doanh-nghiep')
  async newsEnterprise(@Res() res: Response){
    try {
      const data = await this.newsService.newsEnterprise()
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }
}
