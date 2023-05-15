import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LineChartSwagger } from '../kafka/responses/LineChart.response';
import { MarketCashFlowSwagger } from '../kafka/responses/MarketCashFlow.response';
import { BaseResponse } from '../utils/utils.response';
import { ChartService } from './chart.service';
import { GetExchangeAndTimeQueryDto } from './dto/getExchangeAndTimeQuery.dto';
import { GetLiquidityQueryDto } from './dto/getLiquidityQuery.dto';
import { IndexQueryDto } from './dto/indexQuery.dto';
import { TimestampQueryDto } from './dto/timestampQuery.dto';
import { MarketBreadthSwagger } from './responses/MarketBreadth.response';
import { MarketLiquidityChartSwagger } from './responses/MarketLiquidityChart.response';
import { TickerContributeSwagger } from './responses/TickerContribute.response';
import { VnIndexSwagger } from './responses/Vnindex.response';

@Controller('chart')
@ApiTags('Chart - Api')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get('liquidity-today')
  @ApiOperation({
    summary: 'chart thanh khoản hôm nay',
  })
  @ApiOkResponse({ type: MarketLiquidityChartSwagger })
  async getMarketLiquidityToday(@Res() res: Response) {
    const data = await this.chartService.getMarketLiquidityToday();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('liquidity-yesterday')
  @ApiOperation({
    summary: 'chart thanh khoản phiên trước',
  })
  @ApiOkResponse({ type: MarketLiquidityChartSwagger })
  async getMarketLiquidityYesterday(@Res() res: Response) {
    const data = await this.chartService.getMarketLiquidityYesterday();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('market-breadth')
  @ApiOperation({ summary: 'Độ rộng thị trường' })
  @ApiOkResponse({ type: MarketBreadthSwagger })
  async getMarketBreadthNow(@Res() res: Response) {
    const data = await this.chartService.getMarketBreadthNow();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('do-rong-thi-truong')
  @ApiOperation({
    summary: 'Độ rộng thị trường theo sàn và mốc thời gian',
    description: `<h3>
            <font color="#228b22">Các sàn có dữ liệu: </font>
            <font color="#ff4500">HOSE, HNX, UPCOM</font>
            </h3>`,
  })
  @ApiOkResponse({ type: TickerContributeSwagger })
  async getMarketBreadth(
    @Query() q: GetExchangeAndTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.chartService.getMarketBreadth(
      q.exchange.toUpperCase(),
      parseInt(q.type),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('line-chart')
  @ApiOperation({ summary: 'chart line' })
  @ApiOkResponse({ type: VnIndexSwagger })
  async getVnIndex(@Query() q: TimestampQueryDto, @Res() res: Response) {
    const data = await this.chartService.getLineChart(
      parseInt(q.type),
      q.index.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('line-chart-now')
  @ApiOperation({ summary: 'chart line chỉ số realtime' })
  @ApiOkResponse({ type: LineChartSwagger })
  async getLineChartNow(@Query() q: IndexQueryDto, @Res() res: Response) {
    const data = await this.chartService.getLineChartNow(q.index.toUpperCase());
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  //Dòng tiền thị trường
  @Get('market-cash-flow')
  @ApiOperation({ summary: 'phân bố dòng tiền' })
  @ApiOkResponse({ type: MarketCashFlowSwagger })
  async getMarketCashFlow(@Res() res: Response) {
    const data = await this.chartService.getMarketCashFlow();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('ticker-contribute')
  @ApiOperation({
    summary: 'Top cổ phiếu đóng góp',
    description: `<h3>
            <font color="#228b22">Các sàn có dữ liệu: </font>
            <font color="#ff4500">HNX, HSX, VN30</font>
            </h3>`,
  })
  @ApiOkResponse({ type: TickerContributeSwagger })
  async getTickerContribute(
    @Query() q: GetLiquidityQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.chartService.getTickerContribute(q);
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
