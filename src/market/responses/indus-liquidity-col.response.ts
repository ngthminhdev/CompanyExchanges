import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { IndusLiquidityInterface } from '../interfaces/indus-liquidity.interface';
import { IndusLiquidityResponse } from './indus-liquidity.response';

export class IndusLiquidityColResponse extends IndusLiquidityResponse {
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
    type: String,
    example: '#512DA8',
  })
  color: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perChange: number;

  constructor(data?: IndusLiquidityInterface, type: number = 0) {
    super(data, type);
    this.industry = data?.industry || '';
    this.color = UtilCommonTemplate.generateColor(data?.date) || '';
    this.date =
      type === 1
        ? data?.date.toString()
        : UtilCommonTemplate.toDate(data?.date) || '';
    this.perChange = data?.perChange || 0;
  }

  public mapToList(data?: IndusLiquidityInterface[], type: number = 0) {
    return data?.map((item) => new IndusLiquidityColResponse(item, type));
  }
}

export class IndusLiquidityColSwagger {
  @ApiProperty({
    type: IndusLiquidityColResponse,
    isArray: true,
  })
  data: IndusLiquidityColResponse[];
}
