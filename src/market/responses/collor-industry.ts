import { ApiProperty } from '@nestjs/swagger';

export class ColorIndustry {
  @ApiProperty({
    type: String,
    example: '#512DA8',
  })
  color: string;
}
