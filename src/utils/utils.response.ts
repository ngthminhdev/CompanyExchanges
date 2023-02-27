import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiProperty({
    type: Number,
    example: 200,
  })
  readonly status: number;

  @ApiProperty({
    type: String,
    example: 'OK',
  })
  readonly message: string;

  @ApiProperty({})
  readonly data: any;

  constructor({ status, message, data }: Partial<BaseResponse>) {
    this.status = status || 200;
    this.message = message || 'success';
    this.data = data || null;
  }
}
