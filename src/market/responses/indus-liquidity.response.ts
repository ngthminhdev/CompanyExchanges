import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IndusLiquidityInterface } from '../interfaces/indus-liquidity.interface';

export class IndusLiquidityResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  industry: string;

  @ApiProperty({
    type: Date,
    example: '2018/03/30',
  })
  date: Date | string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perChange: number;

  constructor(data?: IndusLiquidityInterface) {
    this.industry = data?.industry || '';
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.perChange = data?.perChange || 0;
  }

  public mapToList(data?: IndusLiquidityInterface[]) {
    return data?.map((item) => new IndusLiquidityResponse(item));
  }
}

export class IndusLiquiditySwagger {
  @ApiProperty({
    type: IndusLiquidityResponse,
    isArray: true,
  })
  data: IndusLiquidityResponse[];
}
