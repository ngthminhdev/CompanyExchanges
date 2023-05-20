import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { BaseResponse } from '../../utils/utils.response';
import { LiquidityGrowthInterface } from '../interfaces/liquidity-growth.interface';

export class LiquidityGrowthResponse {
  @ApiResponseProperty({
    type: String,
  })
  floor: string;

  @ApiResponseProperty({
    type: Number,
  })
  perChange: number;

  @ApiResponseProperty({
    type: Date,
  })
  date: Date | string;

  @ApiResponseProperty({
    type: Number,
  })
  roc: number;

  constructor(data?: LiquidityGrowthInterface | any) {
    switch (data?.floor) {
      case 'VNINDEX':
        this.floor = 'HOSE';
        break;
      case 'HNXINDEX':
        this.floor = 'HNX';
        break;
      case 'UPINDEX':
        this.floor = 'UPCOM';
        break;
      default:
        this.floor = data?.floor || '';
    }
    this.perChange = data?.perChange || 0;
    this.date = UtilCommonTemplate.toDate(data?.date || new Date());
  }

  public mapToList(data?: LiquidityGrowthInterface[] | any[]) {
    return data.map((i) => new LiquidityGrowthResponse(i));
  }
}

export class LiquidityGrowthSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: LiquidityGrowthResponse,
    isArray: true,
  })
  data: LiquidityGrowthResponse[];
}
