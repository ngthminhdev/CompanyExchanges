import { ApiProperty } from '@nestjs/swagger';

export class ExampleQueryDto {
  @ApiProperty({
    type: String,
    example: 'abc',
    description: 'xyz',
  })
  variable: string;
}
