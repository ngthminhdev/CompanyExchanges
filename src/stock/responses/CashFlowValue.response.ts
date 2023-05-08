import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';

export class CashFlowValueResponse {
  @ApiProperty({
    type: String,
    example: 'VCB',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 1502.9,
  })
  price: number;

  @ApiProperty({
    type: Number,
    example: 1502.9,
  })
  cashFlowValue: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.price = data?.price || 0;
    this.cashFlowValue = data?.cashFlowValue || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((i) => new CashFlowValueResponse(i));
  }
}

export class CashFlowValueSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: CashFlowValueResponse,
    isArray: true,
  })
  data: CashFlowValueResponse[];
}
