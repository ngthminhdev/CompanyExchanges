import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { InvestorTransactionInterface } from '../interfaces/investor-transaction.interface';

export class InvestorTransactionResponse {
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
    example: 502.9,
  })
  net_value_foreign: number;

  @ApiProperty({
    type: Number,
    example: 502.9,
  })
  buyVol: number;

  @ApiProperty({
    type: Number,
    example: 502.9,
  })
  sellVol: number;

  @ApiProperty({
    type: Number,
    example: 5.2,
  })
  buyVal: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  sellVal: number;

  @ApiProperty({
    type: Date,
  })
  lastUpdated: Date | string;

  constructor(data?: InvestorTransactionInterface) {
    this.code = data?.code || '';
    this.price = data?.price || 0;
    this.buyVol = data?.buyVol || 0;
    this.sellVol = data?.sellVol || 0;
    this.buyVal = data?.buyVal || 0;
    this.sellVal = +data?.sellVal || 0;
  }

  public mapToList(data?: InvestorTransactionInterface[] | any[]) {
    return data?.map((i) => new InvestorTransactionResponse(i));
  }
}

export class InvestorTransactionSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: InvestorTransactionResponse,
    isArray: true,
  })
  data: InvestorTransactionResponse[];
}
