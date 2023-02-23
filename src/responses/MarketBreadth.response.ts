import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../utils/utils.response';
import { MarketBreadthInterface } from '../interfaces/market-breadth.interface';

export class MarketBreadthRespone {
  @ApiProperty({
    type: String,
    description: 'Ngành',
    example: 'Bán lẻ',
  })
  industry: string;

  @ApiProperty({
    type: 'float',
    description: '% Giá không đổi',
    example: 1.23,
  })
  equal: number;

  @ApiProperty({
    type: 'float',
    description: '% Đạt giá trần',
    example: 3.12,
  })
  high: number;

  @ApiProperty({
    type: 'float',
    description: '% Chạm giá sàn',
    example: 12.09,
  })
  low: number;

  @ApiProperty({
    type: 'float',
    description: '% Giá tăng',
    example: 20.07,
  })
  increase: number;

  @ApiProperty({
    type: 'float',
    description: '% Giá giảm',
    example: 99.99,
  })
  decrease: number;

  constructor(data?: MarketBreadthInterface) {
    const total =
      data?.equal + data?.high + data?.low + data?.increase + data?.decrease;
    this.industry = data?.industry || '';
    this.equal = this.precent(data?.equal, total) || 0;
    this.high = this.precent(data?.high, total) || 0;
    this.low = this.precent(data?.low, total) || 0;
    this.increase = this.precent(data?.increase, total) || 0;
    this.decrease = this.precent(data?.decrease, total) || 0;
  }

  public mapToList(data?: MarketBreadthInterface[]) {
    return data.map((item) => new MarketBreadthRespone(item));
  }

  private precent(value: number, total: number): number {
    return +((value / total) * 100).toFixed(2);
  }
}

export class MarketBreadthSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketBreadthRespone,
    isArray: true,
  })
  data: MarketBreadthRespone[];
}
