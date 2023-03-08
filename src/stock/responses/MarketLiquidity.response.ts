import {ApiProperty, PartialType} from '@nestjs/swagger';
import {BaseResponse} from '../../utils/utils.response';

export class MarketLiquidityResponse {
  @ApiProperty({
    type: String,
    description: 'Mã chứng khoán',
    example: 'VCB',
  })
  ticker: string;

  @ApiProperty({
    type: String,
    description: 'Ngành',
    example: 'Ngân Hàng',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    description: 'Giá trị',
    example: '1',
  })
  value: number;

  @ApiProperty({
    type: "float",
    description: '% thay đổi so với phiên trước',
    example: '0.4',
  })
  value_change_percent: number;

  @ApiProperty({
    type: 'float',
    description: 'Cống hiến',
    example: '0.2',
  })
  contribute: number;

  constructor(data?: any) {
    console.log()
    this.ticker = data?.ticker || '';
    this.industry = data?.industry || '';
    this.value = data?.value || 0;
    this.value_change_percent =
        (data?.value_change_percent !== Infinity && data?.value_change_percent)
        ? data?.value_change_percent : 0;
    this.contribute = data?.contribute || 0;
  }

  public mapToList(data?: MarketLiquidityResponse[] | any[]) {
    return data?.map((item) => new MarketLiquidityResponse(item));
  }
}

export class MarketLiquiditySwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketLiquidityResponse,
    isArray: true,
  })
  data: MarketLiquidityResponse;
}
