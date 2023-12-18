import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { BaseResponse } from '../utils/utils.response';
import { getNewsDto } from './dto/get-news.dto';
import { IdentifyMarketDto, SaveStockRecommendDto } from './dto/identifyMarket.dto';
import { QueryNewsDto } from './dto/queryNews.dto';
import { SaveNewsDto } from './dto/save-news.dto';
import { SaveMarketMovementsDto } from './dto/saveMarketMovements.dto';
import { StockImageDto } from './dto/stock-image.dto';
import { ReportService } from './report.service';
import { AfternoonReport1 } from './response/afternoonReport1.response';
import { EventResponse } from './response/event.response';
import { ExchangeRateResponse } from './response/exchangeRate.response';
import { MerchandiseResponse } from './response/merchandise.response';
import { MorningHoseResponse } from './response/morningHose.response';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';
import { AfterNoonReport2Response } from './response/stockMarket.response';
import { TopScoreResponse } from './response/topScore.response';

@Controller('report')
@ApiTags('Report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService
    ) {}

  // @ApiOperation({summary: 'Chỉ số'})
  // @ApiOkResponse({status: HttpStatus.OK, type: ReportIndexResponse})
  // @Get('chi-so')
  // async getIndex(@Res() res: Response) {
  //   try {
  //     const data = await this.reportService.getIndex();
  //     return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  //   } catch (error) {
  //     throw new CatchException(error)
  //   }
  // }

  // @Post('upload')
  // @UseInterceptors(AnyFilesInterceptor())
  // async upload(@UploadedFiles() file: any){
  //   try {
  //     await this.reportService.uploadFile(file)
  //   } catch (error) {
  //     throw new CatchException(error)
  //   }
  // }

  @Post('upload-report')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadReport(@UploadedFiles() file: any, @Res() res: Response){
    try {
      await this.reportService.uploadFileReport(file)
      return res.status(HttpStatus.OK).send(new BaseResponse({}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @ApiOperation({summary: 'Tin quốc tế'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tin-quoc-te')
  async newsInternational(@Query() q: QueryNewsDto, @Res() res: Response){
    const data = await this.reportService.newsInternational(+q.quantity)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin trong nước'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tin-trong-nuoc')
  async newsDomestic(@Query() q: QueryNewsDto, @Res() res: Response){
    const data = await this.reportService.newsDomestic(+q.quantity)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin doanh nghiệp'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('tin-doanh-nghiep')
  async newsEnterprise(@Query() q: QueryNewsDto, @Res() res: Response){
    const data = await this.reportService.newsEnterprise(+q.quantity)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lịch sự kiện'})
  @ApiOkResponse({status: HttpStatus.OK, type: EventResponse})
  @Get('lich-su-kien')
  async event(@Res() res: Response){
    const data = await this.reportService.event()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tỷ giá'})
  @ApiOkResponse({status: HttpStatus.OK, type: ExchangeRateResponse})
  @Get('ty-gia')
  async exchangeRate(@Res() res: Response){
    const data = await this.reportService.exchangeRate()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Hàng hoá'})
  @ApiOkResponse({status: HttpStatus.OK, type: MerchandiseResponse})
  @Get('hang-hoa')
  async merchandise(@Res() res: Response){
    const data = await this.reportService.merchandise()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lãi suất bình quân liên ngân hàng'})
  @ApiOkResponse({status: HttpStatus.OK, type: ExchangeRateResponse})
  @Get('lai-suat')
  async interestRate(@Res() res: Response){
    const data = await this.reportService.interestRate()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Thị trường chứng khoán Việt Nam và Quốc tế'})
  @ApiOkResponse({status: HttpStatus.OK, type: MerchandiseResponse})
  @Get('thi-truong-chung-khoan')
  async stockMarket(@Res() res: Response){
    const data = await this.reportService.stockMarket()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Diễn biến kết phiên sáng'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsEnterpriseResponse})
  @Get('ket-phien-sang')
  async morning(@Res() res: Response){
    const data = await this.reportService.morning()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Diễn biến kết phiên sáng tại HOSE'})
  @ApiOkResponse({status: HttpStatus.OK, type: MorningHoseResponse})
  @Get('ket-phien-sang-hose')
  async morningHose(@Res() res: Response){
    const data = await this.reportService.morningHose()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Top đóng góp điểm số'})
  @ApiOkResponse({status: HttpStatus.OK, type: TopScoreResponse})
  @Get('top-dong-gop-diem-so')
  async topScore(@Res() res: Response){
    const data = await this.reportService.topScore()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Nhận định thị trường'})
  @ApiOkResponse({status: HttpStatus.OK})
  @Get('nhan-dinh-thi-truong')
  async identifyMarket(@Res() res: Response){
    const data = await this.reportService.identifyMarket()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lưu tin'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-tin')
  async saveNewsInternational(@Body() b: SaveNewsDto, @Res() res: Response){
    const data = await this.reportService.saveNews(+b.id, b.value)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin tức redis'})
  @ApiOkResponse({status: HttpStatus.OK})
  @Get('tin-tuc-redis')
  async newsRedis(@Query() q: getNewsDto, @Res() res: Response){
    const data = await this.reportService.getNews(+q.id)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lưu nhận định thị trường'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-nhan-dinh-thi-truong')
  async saveIdentifyMarket(@Body() b: IdentifyMarketDto, @Res() res: Response){
    const data = await this.reportService.saveIdentifyMarket(b.text)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lưu cổ phiếu khuyến nghị'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-co-phieu-khuyen-nghi')
  async saveStockRecommend(@Body() b: SaveStockRecommendDto, @Res() res: Response){
    const data = await this.reportService.saveStockRecommend(b.stock_buy, b.stock_sell)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Nhận định thị trường redis'})
  @ApiOkResponse({status: HttpStatus.OK})
  @Get('nhan-dinh-thi-truong-redis')
  async identifyMarketReis(@Res() res: Response){
    const data = await this.reportService.identifyMarketRedis()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  //Bản tin chiều
  @ApiOperation({summary: 'Lưu diễn biến thị trường bản tin chiều trang 1'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-dien-bien-thi-truong')
  async saveMarketMovements(@Body() b: SaveMarketMovementsDto, @Res() res: Response){
    const data = await this.reportService.saveMarketMovements(b.text)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Bản tin chiều trang 1'})
  @ApiOkResponse({status: HttpStatus.OK, type: AfternoonReport1})
  @Get('ban-tin-chieu-1')
  async afternoonReport1(@Res() res: Response){
    const data = await this.reportService.afternoonReport1()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @Post('upload-image-report')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({summary: 'Up hình report chiều trang 2', description: 'Truyền lên file jpg, tên gì cũng được'})
  async uploadReportAfternoon(@UploadedFiles() file: any, @Res() res: Response){
    try {
      await this.reportService.uploadImageReport(file)
      return res.status(HttpStatus.OK).send(new BaseResponse({}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @ApiOperation({summary: 'Bản tin chiều trang 2'})
  @ApiOkResponse({status: HttpStatus.OK, type: AfterNoonReport2Response})
  @Get('ban-tin-chieu-2')
  async afternoonReport2(@Res() res: Response){
    const data = await this.reportService.afternoonReport2()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }
}
