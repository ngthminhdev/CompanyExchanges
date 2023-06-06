import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IPayoutRatio } from '../interfaces/payout-ratio.interface';

export class PayoutRatioResponse {
  @ApiProperty({
    type: String,
    example: 'Hóa chất',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 3.609,
  })
  quickRatio: number;

  @ApiProperty({
    type: Number,
    example: 3.609,
  })
  currentRatio: number;

  @ApiProperty({
    type: Number,
    example: 3.609,
  })
  cashRatio: number;

  @ApiProperty({
    type: Date,
    example: '2023/03/31',
  })
  date: Date | string;

  constructor(data?: IPayoutRatio) {
    this.industry = data?.industry || '';
    this.quickRatio = data?.quickRatio || 0;
    this.currentRatio = data?.currentRatio || 0;
    this.cashRatio = data?.cashRatio || 0;
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
  }

  public mapTolist(data?: IPayoutRatio[]) {
    return data?.map((i) => new PayoutRatioResponse(i));
  }
}

export class PayoutRatioSwagger {
  @ApiProperty({
    type: PayoutRatioResponse,
    isArray: true,
  })
  data: PayoutRatioResponse[];
}
