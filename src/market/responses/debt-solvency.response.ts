import { ApiProperty } from '@nestjs/swagger';
import { ISIndsDebtSolvency } from '../interfaces/Inds-debt-solvency.interface';

export class DebtSolvencyResponse {
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
  ICR: number;

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

  constructor(data?: ISIndsDebtSolvency) {
    this.industry = data?.industry || '';
    this.ICR = data?.ICR || 0;
    this.DSCR = data?.DSCR || 0;
    this.DE = data?.DE || 0;
    this.TDTA = data?.TDTA || 0;
    this.date = data?.date.toString() || '';
  }

  public mapToList(data?: ISIndsDebtSolvency[]) {
    return data?.map((i) => new DebtSolvencyResponse(i));
  }
}

export class DebtSolvencySwagger {
  @ApiProperty({
    type: DebtSolvencyResponse,
    isArray: true,
  })
  data: DebtSolvencyResponse[];
}
