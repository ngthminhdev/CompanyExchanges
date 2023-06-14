import { ApiProperty } from '@nestjs/swagger';
import { ISIndsProfitMargins } from '../interfaces/inds-profit-margin.interface';

export class ProfitMarginResponse {
  @ApiProperty({
    type: String,
    example: 'Hóa chất',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Hệ số thanh toán lãi vay',
  })
  GPM: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Chỉ số khả năng trả nợ ',
  })
  DSCR: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'DE',
  })
  DE: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Tỷ lệ nợ trên tổng tài sản ',
  })
  TDTA: number;

  @ApiProperty({
    type: Date,
    example: '20231',
  })
  date: Date | string;

  constructor(data?: ISIndsProfitMargins) {
    this.industry = data?.industry || '';
    this.GPM = data?.GPM || 0;
    // this.DSCR = data?.DSCR || 0;
    // this.DE = data?.DE || 0;
    // this.TDTA = data?.TDTA || 0;
    this.date = data?.date.toString() || '';
  }

  public mapToList(data?: ISIndsProfitMargins[]) {
    return data?.map((i) => new ProfitMarginResponse(i));
  }
}

export class ProfitMarginSwagger {
  @ApiProperty({
    type: ProfitMarginResponse,
    isArray: true,
  })
  data: ProfitMarginResponse[];
}
