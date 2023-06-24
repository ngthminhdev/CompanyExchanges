import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class OrderDto {
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
