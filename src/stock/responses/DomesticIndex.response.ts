import { ApiProperty, PartialType } from '@nestjs/swagger';
import { LineChartInterface } from '../../kafka/interfaces/line-chart.interface';
import { BaseResponse } from '../../utils/utils.response';

export class DomesticIndexResponse {
  @ApiProperty({
    type: String,
    example: 'VNIndex',
  })
  comGroupCode: string;

  @ApiProperty({
    type: Number,
    example: 1502.9,
  })
  indexValue: number;

  @ApiProperty({
    type: Number,
    example: 502.9,
  })
  net_value_foreign: number;

  @ApiProperty({
    type: Number,
    example: 502.9,
  })
  totalMatchVolume: number;

  @ApiProperty({
    type: Number,
    example: 502.9,
  })
  totalMatchValue: number;

  @ApiProperty({
    type: Number,
    example: 5.2,
  })
  indexChange: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  percentIndexChange: number;

  @ApiProperty({
    type: Date,
  })
  lastUpdated: Date | string;

  constructor(data?: LineChartInterface) {
    this.comGroupCode = data?.comGroupCode || '';
    this.indexValue = data?.indexValue || 0;
    this.indexChange = data?.indexChange || 0;
    this.totalMatchVolume = data?.totalMatchVolume || 0;
    this.totalMatchValue = data?.totalMatchValue || 0;
    this.percentIndexChange = data?.percentIndexChange || 0;
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
