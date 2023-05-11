import { ApiProperty } from '@nestjs/swagger';
import { TickerChangeInterface } from '../interfaces/ticker-change.interface';

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

  constructor(data?: TickerChangeInterface, field?: string) {
    this.symbol = data?.ticker || '';
    this.contribute_price = data?.[field] || 0;
  }

  public mapToList(data: TickerChangeInterface[], field: string) {
    return data.map((i) => new TickerContributeKafkaResponse(i, field));
  }
}
