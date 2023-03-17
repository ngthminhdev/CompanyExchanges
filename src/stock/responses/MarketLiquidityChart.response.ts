import {ApiProperty, PartialType} from '@nestjs/swagger';
import {BaseResponse} from '../../utils/utils.response';
import {MarketLiquidityInterface} from "../interfaces/market-liquidity.interface";

export class MarketLiquidityChartResponse {
  @ApiProperty({
    type: Date,
    example: '1826358126738',
  })
  time: any;

  @ApiProperty({
    type: Number,
    example: '1.04',
  })
  value: number;

  constructor(data?: MarketLiquidityInterface) {
    this.time = data?.time ? Date.parse(data?.time) :  Date.now();
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
