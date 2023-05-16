import { GetExchangeQuery } from './getExchangeQuery.dto';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetExchangeAndTimeQueryDto extends GetExchangeQuery {
  @IsEnum(['0', '1', '2', '3', '4', '5'], { message: 'type not found' })
  @ApiProperty({
    type: Number,
    description:
      '0 - phiên hiện tại/ gần nhất, 1 - 5 phiên, 2 - 1 tháng, 3 - YtD, 4 - 1 Quý (3 tháng), 5 - 1 năm',
  })
  type: string;
}
