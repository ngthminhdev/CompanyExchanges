import { ApiProperty } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class PEBResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  code: string;

  @ApiProperty({
    type: Date,
    example: '2023/03/31',
  })
  date: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  VND: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  per: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  pData: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  pricePerChange: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.VND = data?.VND || 0;
    this.per = data?.per || 0;
    this.pData = data?.pData || 0;
    this.pricePerChange = data?.pricePerChange || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((item) => new PEBResponse(item));
  }
}

export class PEBSwagger {
  @ApiProperty({
    type: PEBResponse,
    isArray: true,
  })
  data: PEBResponse[];
}
