import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseResponse } from '../utils/utils.response';
import { CashFlowService } from './cash-flow.service';
import { CashTypeQueryDto } from './dto/cashTypeQuery.dto';
import { GetExchangeAndTimeQueryDto } from './dto/getExchangeAndTimeQuery.dto';
import { TimestampQueryOnlyDto } from './dto/timestampOnlyQuery.dto';
import { InvestorTransactionSwagger } from './responses/InvestorTransaction.response';
import { InvestorTransactionRatioSwagger } from './responses/InvestorTransactionRatio.response';
import { InvestorTransactionValueSwagger } from './responses/InvestorTransactionValue.response';
import { LiquidityGrowthSwagger } from './responses/LiquidityGrowth.response';
import { RsiSwagger } from './responses/Rsi.response';
import { RsiQueryDto } from './dto/rsiQuery.dto';
import { IndustryCashFlowSwagger } from './responses/IndustryCashFlow.response';
import { InvestorCashTimeExDto } from './dto/investorCashTimeEx.dto';
import { InvestorCashFlowByIndustrySwagger } from './responses/InvestorCashFlowByIndustry.response';
import { MarketTotalTransValueSwagger } from './responses/MarketTotalTransValue.response';

@Controller('cash-flow')
@ApiTags('Cash Flow - API')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get('investor-transaction')
  @ApiOperation({
    summary: 'Diễn biến giao dịch nhóm nhà đầu tư',
  })
  @ApiOkResponse({ type: InvestorTransactionSwagger })
  async getTickerContribute(
    @Query() q: CashTypeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getInvestorTransactions(
      parseInt(q.investorType),
      parseInt(q.type),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('value')
  @ApiOperation({
    summary: 'Top giá trị dòng tiền',
  })
  @ApiOkResponse({ type: InvestorTransactionSwagger })
  async getCashFlowValue(
    @Query() q: TimestampQueryOnlyDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getCashFlowValue(parseInt(q.type));
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('investor-transaction-value')
  @ApiOperation({
    summary: 'Giá trị giao dịch toàn thị trường',
  })
  @ApiOkResponse({ type: InvestorTransactionValueSwagger })
  async getInvestorTransactionsValue(@Res() res: Response) {
    const data = await this.cashFlowService.getInvestorTransactionsValue();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('liquidity-growth')
  @ApiOperation({
    summary: 'Mức tăng trưởng thanh khoản',
  })
  @ApiOkResponse({ type: LiquidityGrowthSwagger })
  async getLiquidityGrowth(
    @Query() q: TimestampQueryOnlyDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getLiquidityGrowth(
      parseInt(q.type),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('investor-transaction-ratio')
  @ApiOperation({
    summary: 'Tỷ lệ GTGD theo nhóm NĐT trong phiên',
  })
  @ApiOkResponse({ type: InvestorTransactionRatioSwagger })
  async getInvestorTransactionRatio(@Res() res: Response) {
    const data = await this.cashFlowService.getInvestorTransactionRatio();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('investor-transaction-cash-flow-ratio')
  @ApiOperation({
    summary: 'Tỷ trọng dòng tiền theo nhóm NĐT',
  })
  @ApiOkResponse({ type: InvestorTransactionRatioSwagger })
  async getInvestorTransactionCashFlowRatio(
    @Query() q: GetExchangeAndTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getInvestorTransactionCashFlowRatio(
      parseInt(q.type),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('industry-cash-flow')
  @ApiOperation({
    summary: 'Dòng tiền theo ngành',
  })
  @ApiOkResponse({ type: IndustryCashFlowSwagger })
  async getIndustryCashFlow(
    @Query() q: GetExchangeAndTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getIndustryCashFlow(
      parseInt(q.type),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('rsi')
  @ApiOperation({
    summary: 'Chỉ số RSI',
    description: 'HOSE, HNX, UPCOM',
  })
  @ApiOkResponse({ type: RsiSwagger })
  async getRSI(@Query() q: RsiQueryDto, @Res() res: Response) {
    const data = await this.cashFlowService.getRSI(
      parseInt(q.session),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('top-net-buy-industry')
  @ApiOperation({
    summary: 'Top bán ròng theo ngành',
    description: 'HOSE, HNX, UPCOM',
  })
  @ApiOkResponse({ type: RsiSwagger })
  async getTopNetBuyIndustry(
    @Query() q: GetExchangeAndTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getTopNetBuyIndustry(
      parseInt(q.type),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('investor-cash-flow-by-industry')
  @ApiOperation({
    summary: 'Dòng tiền nhà đầu tư theo các nhóm ngành',
    description: `
      Exchange: HOSE, HNX, UPCOM,
      Timestamp: 2 - 1 thang , 4 - 1 quy(3 thang), 5 - 1 nam
    `,
  })
  @ApiOkResponse({ type: InvestorCashFlowByIndustrySwagger })
  async getInvestorCashFlowByIndustry(
    @Query() q: InvestorCashTimeExDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getInvestorCashFlowByIndustry(
      parseInt(q.investorType),
      parseInt(q.type),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('market-total-value')
  @ApiOperation({
    summary: 'Tổng giá trị giao dịch toàn thị trường',
    description: `
      Timestamp: 2 - 1 thang , 4 - 1 quy(3 thang), 5 - 1 nam
    `,
  })
  @ApiOkResponse({ type: MarketTotalTransValueSwagger })
  async getTotalTransactionValue(
    @Query() q: GetExchangeAndTimeQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.cashFlowService.getTotalTransactionValue(
      parseInt(q.type),
      q.exchange.toUpperCase(),
    );
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }
}
