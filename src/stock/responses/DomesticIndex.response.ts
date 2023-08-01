import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LineChartInterface } from '../../kafka/interfaces/line-chart.interface';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { BaseResponse } from '../../utils/utils.response';

export class DomesticIndexResponse {
  // @ApiProperty({
  //   type: String,
  //   example: 'VNIndex',
  // })
  // comGroupCode: string;

  // @ApiProperty({
  //   type: Number,
  //   example: 1502.9,
  // })
  // indexValue: number;

  // @ApiProperty({
  //   type: Number,
  //   example: 502.9,
  // })
  // net_value_foreign: number;

  // @ApiProperty({
  //   type: Number,
  //   example: 502.9,
  // })
  // totalMatchVolume: number;

  // @ApiProperty({
  //   type: Number,
  //   example: 502.9,
  // })
  // totalMatchValue: number;

  // @ApiProperty({
  //   type: Number,
  //   example: 5.2,
  // })
  // indexChange: number;

  // @ApiProperty({
  //   type: Number,
  //   example: 0.9,
  // })
  // percentIndexChange: number;

  // @ApiProperty({
  //   type: Date,
  // })
  // lastUpdated: Date | string;

  code: string
  timeInday: string
  highPrice: number
  change: number
  totalVol: number
  totalVal: number
  perChange: number

  constructor(data?: any) {
    this.code = data?.code || ''
    this.timeInday = data?.timeInday || ''
    this.highPrice = data?.highPrice || 0
    this.change = data?.change || 0
    this.totalVol = data?.totalVol || 0
    this.totalVal = data?.totalVal || 0
    this.perChange = data?.perChange || 0
  }

  public mapToList(data?: LineChartInterface[] | any[]) {
    return data.map((i) => new DomesticIndexResponse(i));
  }
}

export class DomesticIndexSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: DomesticIndexResponse,
    isArray: true,
  })
  data: DomesticIndexResponse[];
}
