import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { BaseResponse } from '../../utils/utils.response';
import { InvestorTransactionValueInterface } from '../interfaces/investor-transaction-value.interface';

export class InvestorTransactionValueResponse {
  @ApiResponseProperty({
    type: String,
  })
  floor: string;

  @ApiResponseProperty({
    type: Number,
  })
  totalVal: number;

  @ApiResponseProperty({
    type: Date,
  })
  date: Date | string;

  constructor(data?: InvestorTransactionValueInterface) {
    switch (data?.floor) {
      case 'VNINDEX':
        this.floor = 'HOSE';
        break;
      case 'HNINDEX':
        this.floor = 'HNX';
        break;
      default:
        this.floor = 'UPCOM';
    }
    this.totalVal = data?.totalVal || 0;
    this.date = UtilCommonTemplate.toDate(data?.date || new Date());
  }

  public mapToList(data?: InvestorTransactionValueInterface[]) {
    return data.map((i) => new InvestorTransactionValueResponse(i));
  }
}

export class InvestorTransactionValueSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: InvestorTransactionValueResponse,
    isArray: true,
  })
  data: InvestorTransactionValueResponse[];
}
