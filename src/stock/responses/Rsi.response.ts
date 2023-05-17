import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';

export class RsiResponse {
  @ApiProperty({
    type: String,
    example: 'Ban le',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 15,
  })
  cashGain: number;

  @ApiProperty({
    type: Number,
    example: 5,
  })
  cashLost: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  rsCash: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  rsiCash: number;

  constructor(data?: any) {
    this.cashGain = data?.cashGain || 0;
    this.cashLost = data?.cashLost || 0;
    this.rsCash = data?.rsCash || 0;
    this.rsiCash = data?.rsiCash || 0;
  }
}

export class RsiSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: RsiResponse,
    isArray: true,
  })
  data: RsiResponse[];
}
