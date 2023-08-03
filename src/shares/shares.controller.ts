import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CatchException } from '../exceptions/common.exception';
import { NewsEventResponse } from '../news/response/event.response';
import { BaseResponse } from '../utils/utils.response';
import { CastFlowDto } from './dto/castFlow.dto';
import { EnterprisesSameIndustryDto } from './dto/enterprisesSameIndustry.dto';
import { EventCalendarDetailDto } from './dto/eventCalendarDetail.dto';
import { SearchStockDto } from './dto/searchStock.dto';
import { StockOrderDto } from './dto/stock-order.dto';
import { StockDto } from './dto/stock.dto';
import { StockTypeDto } from './dto/stockType.dto';
import { TransactionDataDto } from './dto/transactionData.dto';
import { BusinessResultsResponse } from './responses/businessResults.response';
import { CandleChartResponse } from './responses/candleChart.response';
import { EnterprisesSameIndustryResponse } from './responses/enterprisesSameIndustry.response';
import { EventCalendarResponse } from './responses/eventCalendar.response';
import { FinancialIndicatorsResponse } from './responses/financialIndicators.response';
import { HeaderStockResponse } from './responses/headerStock.response';
import { NewsStockResponse } from './responses/newsStock.response';
import { SearchStockResponse } from './responses/searchStock.response';
import { StatisticsMonthQuarterYearResponse } from './responses/statisticsMonthQuarterYear.response';
import { TradingGroupsInvestorsResponse } from './responses/tradingGroupsInvestors.response';
import { TradingPriceFluctuationsResponse } from './responses/tradingPriceFluctuations.response';
import { TransactionStatisticsResponse } from './responses/transaction-statistics.response';
import { TransactionDataResponse } from './responses/transactionData.response';
import { SharesService } from './shares.service';

@Controller('shares')
@ApiTags('Shares - Site Cổ phiếu')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get('search')
  @ApiOperation({summary: 'Tìm kiếm cổ phiếu'})
  @ApiOkResponse({type: SearchStockResponse})
  async searchStock(@Query() q: SearchStockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.searchStock(q.key_search)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('header')
  @ApiOperation({summary: 'Header'})
  @ApiOkResponse({type: HeaderStockResponse})
  async header(@Query() q: StockTypeDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.header(q.stock, q.type)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('chart-nen')
  @ApiOperation({summary: 'Chart nến'})
  @ApiOkResponse({type: CandleChartResponse})
  async candleChart(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.candleChart(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  //Tổng quan

  @Get('thong-ke-giao-dich')
  @ApiOperation({summary: 'Thống kê giao dịch'})
  @ApiOkResponse({type: TransactionStatisticsResponse})
  async transactionStatistics(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.transactionStatistics(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('ket-qua-kinh-doanh')
  @ApiOperation({summary: 'Kết quả kinh doanh'})
  @ApiOkResponse({type: BusinessResultsResponse})
  async businessResults(@Query() q: StockOrderDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.businessResults(q.stock, +q.order, q.type.toUpperCase())
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('can-doi-ke-toan')
  @ApiOperation({summary: 'Cân đối kế toán'})
  @ApiOkResponse({type: BusinessResultsResponse})
  async balanceSheet(@Query() q: StockOrderDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.balanceSheet(q.stock, +q.order, q.type.toUpperCase())
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }
  
  @Get('luu-chuyen-tien-te')
  @ApiOperation({summary: 'Lưu chuyển tiền tệ'})
  @ApiOkResponse({type: BusinessResultsResponse})
  async castFlow(@Query() q: CastFlowDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.castFlow(q.stock, +q.order)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  } 

  @Get('chi-so-tai-chinh')
  @ApiOperation({summary: 'Chỉ số tài chính'})
  @ApiOkResponse({type: FinancialIndicatorsResponse})
  async financialIndicators(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.financialIndicators(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('doanh-nghiep-cung-nganh')
  @ApiOperation({summary: 'Doanh nghiệp cùng ngành'})
  @ApiOkResponse({type: EnterprisesSameIndustryResponse})
  async enterprisesSameIndustry(@Query() q: EnterprisesSameIndustryDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.enterprisesSameIndustry(q.stock, q.exchange)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('lich-su-kien')
  @ApiOperation({summary: 'Lịch sự kiện'})
  @ApiOkResponse({type: EventCalendarResponse})
  async eventCalendar(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.eventCalendar(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  //Thống kê GD
  @Get('du-lieu-giao-dich')
  @ApiOperation({summary: 'Dữ liệu giao dịch'})
  @ApiOkResponse({type: TransactionDataResponse})
  async transactionData(@Query() q: TransactionDataDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.transactionData(q.stock, q.from, q.to)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('bien-dong-gia-giao-dich')
  @ApiOperation({summary: 'Biến động giá giao dịch'})
  @ApiOkResponse({type: TradingPriceFluctuationsResponse})
  async tradingPriceFluctuations(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.tradingPriceFluctuations(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('khoi-luong-giao-dich-binh-quan-ngay')
  @ApiOperation({summary: 'Khối lượng giao dịch bình quân/ngày'})
  @ApiOkResponse({type: TradingPriceFluctuationsResponse})
  async averageTradingVolume(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.averageTradingVolume(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('thong-ke-theo-cac-thang-quy-nam')
  @ApiOperation({summary: 'Thống kê theo các tháng, quý, năm'})
  @ApiOkResponse({type: StatisticsMonthQuarterYearResponse})
  async statisticsMonthQuarterYear(@Query() q: CastFlowDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.statisticsMonthQuarterYear(q.stock, +q.order)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('giao-dich-cac-nhom-nha-dau-tu')
  @ApiOperation({summary: 'Giao dịch các nhóm nhà đầu tư'})
  @ApiOkResponse({type: TradingGroupsInvestorsResponse})
  async tradingGroupsInvestors(@Query() q: StockDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.tradingGroupsInvestors(q.stock)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }
  
  //Tin tức và sự kiện
  @Get('chi-tiet-lich-su-kien')
  @ApiOperation({summary: 'Chi tiết lịch sự kiện (site tin tức và sự kiện)'})
  @ApiOkResponse({type: NewsEventResponse})
  async eventCalendarDetail(@Query() q: EventCalendarDetailDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.eventCalendarDetail(q.stock, +q.type)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('tin-tuc')
  @ApiOperation({summary: 'Tin tức)'})
  @ApiOkResponse({type: NewsStockResponse})
  async newsStock(@Query() q: EventCalendarDetailDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.newsStock(q.stock, +q.type)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  //Tai chinh doanh nghiep

  @Get('chi-tiet-luu-chuyen-tien-te')
  @ApiOperation({summary: 'Báo cáo lưu chuyển tiền tệ'})
  @ApiOkResponse({type: NewsStockResponse})
  async castFlowDetail(@Query() q: CastFlowDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.castFlowDetail(q.stock, +q.order, +q.is_chart)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }

  @Get('chi-tiet-ket-qua-kinh-doanh')
  @ApiOperation({summary: 'Báo cáo kết quả kinh doanh'})
  @ApiOkResponse({type: NewsStockResponse})
  async businessResultDetail(@Query() q: CastFlowDto, @Res() res: Response) {
    try {
      const data = await this.sharesService.businessResultDetail(q.stock, +q.order, +q.is_chart)
      return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
    } catch (e) {
      throw new CatchException(e)
    }
  }
}
