import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { IndustryInterface } from '../interfaces/industry.interface';

export class IndustryResponse {
  @ApiProperty({
    type: String,
    description: 'Ngành',
    example: 'Bán lẻ',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    description: 'Số lượng mã cỗ phiếu Giá không đổi',
    example: 10,
  })
  equal: number;

  @ApiProperty({
    type: Number,
    description: 'Số lượng mã cỗ phiếu Đạt giá trần',
    example: 10,
  })
  high: number;

  @ApiProperty({
    type: Number,
    description: 'Số lượng mã cỗ phiếu Chạm giá sàn',
    example: 10,
  })
  low: number;

  @ApiProperty({
    type: Number,
    description: 'Số lượng mã cỗ phiếu Giá tăng',
    example: 10,
  })
  increase: number;

  @ApiProperty({
    type: Number,
    description: 'Số lượng mã cỗ phiếu Giá giảm',
    example: 10,
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

  @ApiProperty({
    type: 'float',
    description: '% Giá giảm từ đầu năm',
    example: 99.99,
  })
  ytd: number;

  constructor(data?: IndustryInterface) {
    this.industry = data?.industry || '';
    this.equal = data?.equal || 0;
    this.high = data?.high || 0;
    this.low = data?.low || 0;
    this.increase = data?.increase || 0;
    this.decrease = data?.decrease || 0;
    this.day_change_percent = data?.day_change_percent || 0;
    this.week_change_percent = data?.week_change_percent || 0;
    this.month_change_percent = data?.month_change_percent || 0;
    this.ytd = data?.ytd || 0;
  }

  public mapToList(data?: IndustryInterface[]) {
    return data.map((item) => new IndustryResponse(item));
  }
}

export class IndustrySwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: IndustryResponse,
    isArray: true,
  })
  data: IndustryResponse[];
}
