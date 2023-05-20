import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { IndustryFullInterface } from '../interfaces/industry-full.interface';

export class UpDownTickerResponse {
  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  equal: number;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  high: number;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  low: number;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  increase: number;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  decrease: number;

  constructor(data?: IndustryFullInterface) {
    this.equal = data?.equal || 0;
    this.high = data?.high || 0;
    this.low = data?.low || 0;
    this.increase = data?.increase || 0;
    this.decrease = data?.decrease || 0;
  }

  public mapToList(data?: IndustryFullInterface[] | any[]) {
    return data.map((i) => new UpDownTickerResponse(i));
  }
}

export class UpDownTickerSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: UpDownTickerResponse,
    isArray: true,
  })
  data: UpDownTickerResponse[];
}
