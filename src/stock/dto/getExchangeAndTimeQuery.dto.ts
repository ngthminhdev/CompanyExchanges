import { GetExchangeQuery } from './getExchangeQuery.dto';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetExchangeAndTimeQueryDto extends GetExchangeQuery {
  @IsEnum(['0', '1', '2', '3'], { message: 'type not found' })
  @ApiProperty({
    type: Number,
    description:
      '0 - phiên hiện tại/ gần nhất, 1 - 1 tháng, 2 - 1 Quy, 3 - YtD',
  })
  type: string;
}
