import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { InvestorCashFlowByIndustryInterface } from '../interfaces/investor-cash-flow-by-industry.interface';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class InvestorCashFlowByIndustryResponse {
  @ApiProperty({
    type: String,
    example: 1.05,
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  buyVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  sellVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  netVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  transVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  type: number;

  @ApiProperty({
    type: Date,
    example: 1.05,
  })
  date: Date | string;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  marketTotalVal: number;

  @ApiProperty({
    type: Number,
    example: 1.05,
  })
  percent: number;

  constructor(data?: InvestorCashFlowByIndustryInterface) {
    this.industry = data?.industry || '';
    this.buyVal = data?.buyVal || 0;
    this.sellVal = data?.sellVal || 0;
    this.netVal = data?.netVal || 0;
    this.transVal = data?.transVal || 0;
    this.type = data?.type || 0;
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.marketTotalVal = data?.marketTotalVal || 0;
    this.percent = data?.percent || 0;
  }

  public mapToList(data?: InvestorCashFlowByIndustryInterface[]) {
    return data?.map((i) => new InvestorCashFlowByIndustryResponse(i));
  }
}

export class InvestorCashFlowByIndustrySwagger extends PartialType(
  BaseResponse,
) {
  @ApiProperty({
    type: InvestorCashFlowByIndustryResponse,
    isArray: true,
  })
  data: InvestorCashFlowByIndustryResponse[];
}
