import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IndustryFilterDto } from './industry-filter.dto';

export class MarketTimeQueryDto extends IndustryFilterDto {
  @IsEnum(['0', '1', '2', '3', '4', '5'], { message: 'type not found' })
  @ApiProperty({
    type: Number,
    example: '',
    description: `
    2 - 2 kỳ gần nhất,
    4 - 4 kỳ gần nhất,
    8 - 8 kỳ gần nhất,
    12 - 12 kỳ gần nhất,
    25 - 25 kỳ gần nhất
    `,
  })
  type: string;
}
