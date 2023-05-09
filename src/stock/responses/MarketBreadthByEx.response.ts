import { ApiProperty, PartialType } from '@nestjs/swagger';
import { MarketBreadthKafkaInterface } from '../../kafka/interfaces/market-breadth-kafka.interface';
import { BaseResponse } from '../../utils/utils.response';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class MarketBreadthByExResponse {
  @ApiProperty({
    type: String,
    example: 'VNINDEX',
  })
  index: string;

  @ApiProperty({
    type: 'float',
    example: 45,
  })
  noChange: number;

  @ApiProperty({
    type: 'float',
    example: 45,
  })
  decline: number;

  @ApiProperty({
    type: 'float',
    example: 45,
  })
  advance: number;

  @ApiProperty({
    type: String,
    example: '09:15:55',
  })
  time: any;

  constructor(data?: MarketBreadthKafkaInterface) {
    this.index = data?.index || '';
    this.noChange = data?.noChange || 0;
    this.decline = data?.decline || 0;
    this.advance = data?.advance || 0;
    this.time = UtilCommonTemplate.toDate(data?.time || new Date());
  }

  public mapToList(data?: MarketBreadthKafkaInterface[]) {
    return data.map((item) => new MarketBreadthByExResponse(item));
  }
}

export class MarketBreadthSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: MarketBreadthByExResponse,
    isArray: true,
  })
  data: MarketBreadthByExResponse;
}
