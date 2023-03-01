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

  @ApiProperty({
    type: 'float',
    description: '% Giá giảm ngày',
    example: 99.99,
  })
  day_change_percent: number;

  @ApiProperty({
    type: 'float',
    description: '% Giá giảm tuần',
    example: 99.99,
  })
  week_change_percent: number;

  @ApiProperty({
    type: 'float',
    description: '% Giá giảm tháng',
    example: 99.99,
  })
  month_change_percent: number;

  constructor(data?: MarketBreadthInterface) {
    const total =
      data?.equal + data?.high + data?.low + data?.increase + data?.decrease;
    this.industry = data?.industry || '';
    this.equal = this.percent(data?.equal, total) || 0;
    this.high = this.percent(data?.high, total) || 0;
    this.low = this.percent(data?.low, total) || 0;
    this.increase = this.percent(data?.increase, total) || 0;
    this.decrease = this.percent(data?.decrease, total) || 0;
    this.day_change_percent = data?.day_change_percent || 0;
    this.week_change_percent = data?.week_change_percent || 0;
    this.month_change_percent = data?.month_change_percent || 0;
  }

  public mapToList(data?: MarketBreadthInterface[]) {
    return data.map((item) => new MarketBreadthRespone(item));
  }

  private percent(value: number, total: number): number {
    return +(value / total) * 100;
  }
}

export class MarketBreadthSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketBreadthRespone,
    isArray: true,
  })
  data: MarketBreadthRespone[];
}
