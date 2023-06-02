import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumberString } from 'class-validator';
import { GetExchangeQuery } from '../../stock/dto/getExchangeQuery.dto';

export class TimeFrameDto extends GetExchangeQuery {
  @IsNumberString({}, { message: 'type not found' })
  @ApiProperty({
    type: Number,
    example: '',
    description: `
    2 - 2 kỳ gần nhất,
    4 - 4 kỳ gần nhất,
    8 - 8 kỳ gần nhất,
    12 - 12 kỳ gần nhất,
    20 - 20 kỳ gần nhất
    `,
  })
  type: string;

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
