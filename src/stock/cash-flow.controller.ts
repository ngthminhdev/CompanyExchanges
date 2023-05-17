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

@Controller('cash-flow')
@ApiTags('Cash Flow - API')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get('investor-transaction')
  @ApiOperation({
    summary: 'Diễn biến giao dịch đầu tư',
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
    summary: 'Giá trị dòng tiền',
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
    summary: 'Giá trị giao dịch nhà đầu tư',
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
    summary: 'Tỷ lệ giá trị giao dịch nhà đầu tư trong phiên',
  })
  @ApiOkResponse({ type: InvestorTransactionRatioSwagger })
  async getInvestorTransactionRatio(@Res() res: Response) {
    const data = await this.cashFlowService.getInvestorTransactionRatio();
    return res.status(HttpStatus.OK).send(new BaseResponse({ data }));
  }

  @Get('investor-transaction-cash-flow-ratio')
  @ApiOperation({
    summary: 'Tỷ lệ giá trị giao dịch nhà đầu tư trong phiên',
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
  @ApiOkResponse({ type: InvestorTransactionRatioSwagger })
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
}
