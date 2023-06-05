import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IPayoutRatio } from '../interfaces/payout-ratio.interface';

export class CashRatioResponse {
  @ApiProperty({
    type: String,
    example: 'Hóa chất',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 3.609,
  })
  cashRatio: number;

  @ApiProperty({
    type: Date,
    example: '20231',
  })
  date: Date | string;

  constructor(data?: IPayoutRatio) {
    this.industry = data?.industry || '';
    this.cashRatio = data?.cashRatio || 0;
    this.date = data?.date.toString() || '';
  }

  public mapTolist(data?: IPayoutRatio[], type?: number) {
    return data?.map((i) => new CashRatioResponse(i));
  }
}

export class CashRatioSwagger {
  @ApiProperty({
    type: CashRatioResponse,
    isArray: true,
  })
  data: CashRatioResponse[];
}
