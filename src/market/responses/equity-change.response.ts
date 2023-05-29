import { ApiProperty } from '@nestjs/swagger';

export class EquityChangeResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  laiChuPhanPhoi: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  loiIchCoDong: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  vonChuSoHuu: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  thangDuVon: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.laiChuPhanPhoi = data?.laiChuPhanPhoi || 0;
    this.loiIchCoDong = data?.loiIchCoDong || 0;
    this.vonChuSoHuu = data?.vonChuSoHuu || 0;
    this.thangDuVon = data?.thangDuVon || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((item) => new EquityChangeResponse(item));
  }
}

export class EquityChangeSwagger {
  @ApiProperty({
    type: EquityChangeResponse,
    isArray: true,
  })
  data: EquityChangeResponse[];
}
