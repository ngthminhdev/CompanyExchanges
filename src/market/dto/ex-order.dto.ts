import { IsEnum } from 'class-validator';
import { GetExchangeQuery } from '../../stock/dto/getExchangeQuery.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangeOrderDto extends GetExchangeQuery {
  @IsEnum(['0', '1'], { message: 'order not found' })
  @ApiProperty({
    type: Number,
    example: '',
    description: `
    0 - Quý,
    1 - Năm,
    `,
  })
  order: string;
}
