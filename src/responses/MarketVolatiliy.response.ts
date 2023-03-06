import {ApiProperty, PartialType} from '@nestjs/swagger';
import {BaseResponse} from '../utils/utils.response';

export class MarketVolatilityResponse {
  @ApiProperty({
    type: String,
    description: 'Mã sàn chứng khoán',
    example: 'VN30',
  })
  ticker: string;

  @ApiProperty({
    type: Number,
    description: 'Tỷ lệ thay đổi so với phiên trước',
    example: '-1',
  })
  day_change_percent: number;

  @ApiProperty({
    type: Number,
    description: 'Tỷ lệ thay đổi trung bình tuần ',
    example: '0.4',
  })
  week_change_percent: number;

  @ApiProperty({
    type: Number,
    description: 'Tỷ lệ thay đổi trung bình tháng',
    example: '2',
  })
  month_change_percent: number;

  @ApiProperty({
    type: Number,
    description: 'Tỷ lệ thay đổi trung bình năm',
    example: '-5',
  })
  year_change_percent: number;

  constructor(data?: any) {
    this.ticker = data?.ticker ?? '';
    this.day_change_percent = data?.day_change_percent ?? 0;
    this.week_change_percent = data?.week_change_percent ?? 0;
    this.month_change_percent = data?.month_change_percent ?? 0;
    this.year_change_percent = data?.year_change_percent ?? 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((item) => new MarketVolatilityResponse(item));
  }
}

export class MarketVolatilitySwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketVolatilityResponse,
    isArray: true,
  })
  data: MarketVolatilityResponse;
}
