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
  epsVND: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  epsPer: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  avgTotalVal: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  pricePerChange: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
    this.epsVND = data?.epsVND || 0;
    this.epsPer = data?.epsPer || 0;
    this.avgTotalVal = data?.avgTotalVal || 0;
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
