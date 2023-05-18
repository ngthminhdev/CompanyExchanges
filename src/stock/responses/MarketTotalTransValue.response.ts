import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class MarketTotalTransValueResponse {
  @ApiProperty({
    type: String,
    example: 'Ngan Hang',
  })
  industry: string;

  @ApiProperty({
    type: Date,
    example: new Date(),
  })
  date: Date | string;

  @ApiProperty({
    type: Number,
    example: 1502.9,
  })
  marketTotalVal: number;

  constructor(data?: any) {
    this.industry = data?.industry || '';
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.marketTotalVal = data?.marketTotalVal || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((i) => new MarketTotalTransValueResponse(i));
  }
}

export class MarketTotalTransValueSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketTotalTransValueResponse,
    isArray: true,
  })
  data: MarketTotalTransValueResponse[];
}
