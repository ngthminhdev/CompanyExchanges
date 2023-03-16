import {ApiProperty, PartialType} from '@nestjs/swagger';
import {BaseResponse} from '../../utils/utils.response';
import {MarketLiquidityInterface} from "../interfaces/market-liquidity.interface";

export class MarketLiquidityChartResponse {
  @ApiProperty({
    type: Date,
    example: '2023-03-16 09:15:05.000',
  })
  time: Date | number;

  @ApiProperty({
    type: Number,
    example: '1.04',
  })
  value: number;

  constructor(data?: MarketLiquidityInterface) {
    this.time = data?.time || new Date();
    this.value = data?.value || 0;
  }

  public mapToList(data?: MarketLiquidityChartResponse[] | any[]) {
    return data?.map((item) => new MarketLiquidityChartResponse(item));
  }
}

export class MarketLiquidityChartSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketLiquidityChartResponse,
    isArray: true,
  })
  data: MarketLiquidityChartResponse;
}
