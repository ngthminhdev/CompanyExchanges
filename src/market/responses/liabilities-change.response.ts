import { ApiProperty } from '@nestjs/swagger';

export class LiabilitiesChangeResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  noNganHan: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  noDaiHan: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  tiSoThanhToanNhanh: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.noNganHan = data?.noNganHan || 0;
    this.noDaiHan = data?.noDaiHan || 0;
    this.tiSoThanhToanNhanh = data?.tiSoThanhToanNhanh || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((item) => new LiabilitiesChangeResponse(item));
  }
}

export class LiabilitiesChangeSwagger {
  @ApiProperty({
    type: LiabilitiesChangeResponse,
    isArray: true,
  })
  data: LiabilitiesChangeResponse[];
}
