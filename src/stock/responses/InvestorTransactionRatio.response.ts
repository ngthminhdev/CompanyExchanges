import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { InvestorTransactionRatioInterface } from '../interfaces/investor-transaction-ratio.interface';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class InvestorTransactionRatioResponse {
  @ApiProperty({
    type: Number,
    example: '0',
    description: ' 0 - Tu doanh, 1 - Khoi ngoai, 2 - Ca Nhan',
  })
  type: number;

  @ApiProperty({
    type: Number,
    example: 5.2,
  })
  buyVal: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  sellVal: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  netVal: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  totalVal: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  percent: number;

  @ApiProperty({
    type: Date,
  })
  date: Date | string;

  constructor(data?: InvestorTransactionRatioInterface) {
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.type = data?.type || 0;
    this.buyVal = data?.buyVal || 0;
    this.sellVal = data?.sellVal || 0;
    this.netVal = data?.netVal || 0;
    this.totalVal = +data?.totalVal || 0;
    this.percent = data?.percent || 0;
  }

  public mapToList(data?: InvestorTransactionRatioInterface[] | any[]) {
    return data?.map((i) => new InvestorTransactionRatioResponse(i));
  }
}

export class InvestorTransactionRatioSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: InvestorTransactionRatioResponse,
    isArray: true,
  })
  data: InvestorTransactionRatioResponse[];
}
