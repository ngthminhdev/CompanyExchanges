import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { GetExchangeQuery } from '../stock/dto/getExchangeQuery.dto';
import { BaseResponse } from '../utils/utils.response';
import { PageLimitDto } from './dto/page-limit.dto';
import { NewsService } from './news.service';
import { NewsEventResponse } from './response/event.response';
import { FilterResponse } from './response/filer.response';
import { MacroDomesticResponse } from './response/macro-domestic.response';
import { NewsEnterpriseResponse } from './response/news-enterprise.response';
import { NewsFilterDto } from './dto/news-filter.dto';
import { NewsFilterResponse } from './response/news-filter.response';

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

  @ApiOperation({summary: 'Tin vĩ mô trong nước'})
  @ApiOkResponse({type: MacroDomesticResponse})
  @Get('vi-mo-trong-nuoc')
  async macroDomestic(@Res() res: Response, @Query() q: PageLimitDto){
    try {
      const data = await this.newsService.macroDomestic(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }
  
  @ApiOperation({summary: 'Tin vĩ mô quốc tế'})
  @ApiOkResponse({type: MacroDomesticResponse})
  @Get('vi-mo-quoc-te')
  async macroInternational(@Res() res: Response, @Query() q: PageLimitDto){
    try {
      const data = await this.newsService.macroInternational(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @Get('filter')
  @ApiOperation({summary: 'Bộ lọc'})
  @ApiOkResponse({type: FilterResponse})
  async filter(@Res() res: Response){
    try {
      const data = await this.newsService.filter();
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @ApiOperation({summary: 'Bộ lọc tin tức'})
  @ApiOkResponse({type: NewsFilterResponse})
  @Get('bo-loc-tin-tuc')
  async newsFilter(@Res() res: Response, @Query() q: NewsFilterDto){
    try {
      const data = await this.newsService.newsFilter(q)
      return res.status(HttpStatus.OK).send(new BaseResponse({data}))
    } catch (error) {
      throw new CatchException(error)
    }
  }
}
