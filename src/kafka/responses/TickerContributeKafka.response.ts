import { ApiProperty } from '@nestjs/swagger';
import { TickerContributeKafkaInterface } from '../interfaces/ticker-contribute-kafka.interface';

export class TickerContributeKafkaResponse {
  @ApiProperty({
    type: String,
    example: 'VCB',
  })
  symbol: string;

  @ApiProperty({
    type: Number,
    example: 65.5,
  })
  contribute_price: number;

  constructor(data?: TickerContributeKafkaInterface, field?: string) {
    this.symbol = data?.symbol || '';
    this.contribute_price = data?.[field] || 0;
  }

  public mapToList(data: TickerContributeKafkaInterface[], field: string) {
    return data.map((i) => new TickerContributeKafkaResponse(i, field));
  }
}
