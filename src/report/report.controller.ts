import { Body, Controller, Get, HttpStatus, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import { CatchException } from '../exceptions/common.exception';
import { StockDto } from '../shares/dto/stock.dto';
import { BaseResponse } from '../utils/utils.response';
import { getNewsDto } from './dto/get-news.dto';
import { IdentifyMarketDto, SaveStockRecommendDto } from './dto/identifyMarket.dto';
import { QueryNewsDto } from './dto/queryNews.dto';
import { SaveNewsDto } from './dto/save-news.dto';
import { SaveMarketCommentDto } from './dto/saveMarketMovements.dto';
import { SaveStockRecommendWeekDto } from './dto/saveStockRecommendWeek.dto';
import { SetFlexiblePageDto } from './dto/setFlexiblePage.dto';
import { StockMarketDto } from './dto/stockMarket.dto';
import { TopNetBuyingAndSellingDto } from './dto/topNetBuyingAndSelling.dto';
import { ReportService } from './report.service';
import { AfternoonReport1, IStockContribute } from './response/afternoonReport1.response';
import { BuyingAndSellingStatisticsResponse } from './response/buyingAndSellingStatistics.response';
import { EventResponse } from './response/event.response';
import { ExchangeRateResponse } from './response/exchangeRate.response';
import { ExchangeRateUSDEURResponse } from './response/exchangeRateUSDEUR.response';
import { GetStockRecommendWeekResponse } from './response/getStockRecommendWeek.response';
import { LiquidityMarketResponse } from './response/liquidityMarket.response';
import { MerchandiseResponse } from './response/merchandise.response';
import { MorningHoseResponse } from './response/morningHose.response';
import { NewsEnterpriseResponse } from './response/newsEnterprise.response';
import { NewsInternationalResponse } from './response/newsInternational.response';
import { AfterNoonReport2Response } from './response/stockMarket.response';
import { TechnicalIndexResponse } from './response/technicalIndex.response';
import { TopScoreResponse } from './response/topScore.response';
import { TransactionValueFluctuationsResponse } from './response/transactionValueFluctuations.response';
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
    const data = await this.reportService.newsInternational(+q.quantity, +q.type || 0)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tin trong nước'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tin-trong-nuoc')
  async newsDomestic(@Query() q: QueryNewsDto, @Res() res: Response){
    const data = await this.reportService.newsDomestic(+q.quantity, +q.type || 0)
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
  async stockMarket(@Query() q: StockMarketDto, @Res() res: Response){
    const data = await this.reportService.stockMarket(q.type || 0)
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
  async saveMarketMovements(@Body() b: SaveMarketCommentDto, @Res() res: Response){
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

  // @Post('upload-image-report')
  // @UseInterceptors(AnyFilesInterceptor())
  // @ApiOperation({summary: 'Up hình report chiều trang 2', description: 'Truyền lên file jpg, tên gì cũng được'})
  // async uploadReportAfternoon(@UploadedFiles() file: any, @Res() res: Response){
  //   try {
  //     await this.reportService.uploadImageReport(file, 0)
  //     return res.status(HttpStatus.OK).send(new BaseResponse({}))
  //   } catch (error) {
  //     throw new CatchException(error)
  //   }
  // }

  @ApiOperation({summary: 'Lưu nhận định thị trường bản tin chiều trang 2'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-nhan-dinh-thi-truong-chieu')
  async saveMarketComment(@Body() b: SaveMarketCommentDto, @Res() res: Response){
    const data = await this.reportService.saveMarketComment(b.text, b.img)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Bản tin chiều trang 2'})
  @ApiOkResponse({status: HttpStatus.OK, type: AfterNoonReport2Response})
  @Get('ban-tin-chieu-2')
  async afternoonReport2(@Res() res: Response){
    const data = await this.reportService.afternoonReport2()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Biến động GTGD một số ngành quan trọng'})
  @ApiOkResponse({status: HttpStatus.OK, type: TransactionValueFluctuationsResponse})
  @Get('bien-dong-gtgd')
  async transactionValueFluctuations(@Query() q: StockMarketDto, @Res() res: Response){
    const data = await this.reportService.transactionValueFluctuations(q.type || 0)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Thanh khoản thị trường qua 60 phiên gần nhất'})
  @ApiOkResponse({status: HttpStatus.OK, type: LiquidityMarketResponse})
  @Get('thanh-khoan-thi-truong')
  async liquidityMarket(@Res() res: Response){
    const data = await this.reportService.liquidityMarket()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tỷ trọng dòng tiền các nhóm NĐT qua 60 phiên gần nhất'})
  @ApiOkResponse({status: HttpStatus.OK, type: LiquidityMarketResponse})
  @Get('ty-trong-dong-tien')
  async cashFlowRatio(@Res() res: Response){
    const data = await this.reportService.cashFlowRatio()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Top ngành mua bán ròng khối ngoại, tự doanh'})
  @ApiOkResponse({status: HttpStatus.OK, type: IStockContribute})
  @Get('top-mua-ban-rong')
  async topNetBuyingAndSelling(@Query() q: TopNetBuyingAndSellingDto, @Res() res: Response){
    const data = await this.reportService.topNetBuyingAndSelling(+q.type)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Dòng tiền ròng khối ngoại, tự doanh qua 20 phiên gần nhất'})
  @ApiOkResponse({status: HttpStatus.OK, type: LiquidityMarketResponse})
  @Get('dong-tien-rong')
  async cashFlow(@Query() q: TopNetBuyingAndSellingDto, @Res() res: Response){
    const data = await this.reportService.cashFlow(+q.type)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Phân ngành'})
  @ApiOkResponse({status: HttpStatus.OK})
  @Get('phan-nganh')
  async industry(@Query() q: StockMarketDto, @Res() res: Response){
    const data = await this.reportService.industry(+q.type || 0)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lưu diễn biến thị trường bản tin tuần trang 1'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-dien-bien-thi-truong-tuan')
  async saveMarketWeekMovements(@Body() b: SaveMarketCommentDto, @Res() res: Response){
    const data = await this.reportService.saveMarketWeekComment(b.text)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Bản tin tuần trang 1'})
  @ApiOkResponse({status: HttpStatus.OK, type: AfternoonReport1})
  @Get('ban-tin-tuan-1')
  async weekReport1(@Res() res: Response){
    const data = await this.reportService.weekReport1()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lưu nhận định thị trường bản tin tuần trang 2'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-nhan-dinh-thi-truong-tuan-trang-2')
  async saveMarketWeekPage2(@Body() b: SaveMarketCommentDto, @Res() res: Response){
    const data = await this.reportService.saveMarketWeekPage2(b.text)
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @Post('upload-image-report-2')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({summary: 'Up hình report tuần trang 2', description: 'Truyền lên file jpg, tên gì cũng được'})
  async uploadReportWeek(@UploadedFiles() file: any, @Res() res: Response){
    try {
      await this.reportService.uploadImageReport(file, 1)
      return res.status(HttpStatus.OK).send(new BaseResponse({}))
    } catch (error) {
      throw new CatchException(error)
    }
  }

  @ApiOperation({summary: 'Bản tin tuần trang 2'})
  @ApiOkResponse({status: HttpStatus.OK, type: AfterNoonReport2Response})
  @Get('ban-tin-tuan-2')
  async weekReport2(@Res() res: Response){
    const data = await this.reportService.weekReport2()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Hiệu suất sinh lời của các chỉ số trong tuần'})
  @ApiOkResponse({status: HttpStatus.OK, type: IStockContribute})
  @Get('hieu-suat-sinh-loi-chi-so-theo-tuan')
  async profitablePerformanceIndex(@Res() res: Response){
    const data = await this.reportService.profitablePerformanceIndex()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Hiệu suất sinh lời theo các nhóm ngành (Tuần)'})
  @ApiOkResponse({status: HttpStatus.OK, type: IStockContribute})
  @Get('hieu-suat-sinh-loi-nhom-nganh-theo-tuan')
  async profitablePerformanceIndustry(@Res() res: Response){
    const data = await this.reportService.profitablePerformanceIndustry()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tỷ giá USD và EUR'})
  @ApiOkResponse({status: HttpStatus.OK, type: ExchangeRateUSDEURResponse})
  @Get('ty-gia-usd-eur')
  async exchangeRateUSDEUR(@Res() res: Response){
    const data = await this.reportService.exchangeRateUSDEUR()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Lãi suất BQ liên Ngân hàng (%/năm)'})
  @ApiOkResponse({status: HttpStatus.OK, type: ExchangeRateUSDEURResponse})
  @Get('lai-suat-binh-quan-lien-ngan-hang')
  async averageInterbankInterestRate(@Res() res: Response){
    const data = await this.reportService.averageInterbankInterestRate()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Biến động giá cả hàng hóa'})
  @ApiOkResponse({status: HttpStatus.OK, type: ExchangeRateUSDEURResponse})
  @Get('bien-dong-gia-ca-hang-hoa')
  async commodityPriceFluctuations(@Res() res: Response){
    const data = await this.reportService.commodityPriceFluctuations()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  // @ApiOperation({summary: 'Lưu danh sách cổ phiếu khuyến nghị bản tin tuần'})
  // @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  // @Post('luu-co-phieu-khuyen-nghi-tuan')
  // async saveStockRecommendWeek(@Body() b: SaveStockRecommendWeekDto, @Res() res: Response){
  //   const data = await this.reportService.saveStockRecommendWeek(b.value)
  //   return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  // }

  @ApiOperation({summary: 'Danh sách cổ phiếu khuyến nghị bản tin tuần'})
  @ApiOkResponse({status: HttpStatus.OK, type: GetStockRecommendWeekResponse})
  @Get('co-phieu-khuyen-nghi-tuan')
  async stockRecommendWeek(@Body() b: SaveStockRecommendWeekDto, @Res() res: Response){
    const data = await this.reportService.getStockRecommendWeek()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @FormDataRequest()
  @ApiOperation({summary: 'Lưu trang linh động'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Post('luu-trang-linh-dong')
  async setFlexiblePage(@Body() b: SetFlexiblePageDto, @Res() res: Response){
    await this.reportService.setFlexiblePage(b)
    return res.status(HttpStatus.OK).send(new BaseResponse({}))
  }

  @ApiOperation({summary: 'Lấy trang linh động'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('trang-linh-dong')
  async getFlexiblePage(@Body() b: SaveStockRecommendWeekDto, @Res() res: Response){
    const data = await this.reportService.getFlexiblePage()
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  /**
   * Báo cáo phân tích kỹ thuật
   */

  @ApiOperation({summary: 'Thông tin cổ phiếu'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('thong-tin-co-phieu')
  async stockInfo(@Query() b: StockDto, @Res() res: Response){
    const data = await this.reportService.stockInfo(b.stock.toUpperCase())
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Tương quan biến động giá cổ phiếu trong 1 năm'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('tuong-quan-bien-dong-gia')
  async priceFluctuationCorrelation(@Query() b: StockDto, @Res() res: Response){
    const data = await this.reportService.priceFluctuationCorrelation(b.stock.toUpperCase())
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Biến động giá (%)'})
  @ApiOkResponse({status: HttpStatus.OK, type: NewsInternationalResponse})
  @Get('bien-dong-gia')
  async priceChange(@Query() b: StockDto, @Res() res: Response){
    const data = await this.reportService.priceChange(b.stock.toUpperCase())
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Thống kê lệnh mua bán chủ động'})
  @ApiOkResponse({status: HttpStatus.OK, type: BuyingAndSellingStatisticsResponse})
  @Get('thong-ke-lenh-mua-ban')
  async buyingAndSellingStatistics(@Query() b: StockDto, @Res() res: Response){
    const data = await this.reportService.buyingAndSellingStatistics(b.stock.toUpperCase())
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }

  @ApiOperation({summary: 'Chỉ số kỹ thuật'})
  @ApiOkResponse({status: HttpStatus.OK, type: TechnicalIndexResponse})
  @Get('chi-so-ky-thuat')
  async technicalIndex(@Query() b: StockDto, @Res() res: Response){
    const data = await this.reportService.technicalIndex(b.stock.toUpperCase())
    return res.status(HttpStatus.OK).send(new BaseResponse({data}))
  }
}
