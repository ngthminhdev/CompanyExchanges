import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../utils/utils.response';
import { MarketBreadthInterface } from '../interfaces/market-breadth.interface';
import {UtilCommonTemplate} from "../utils/utils.common";

export class NetTransactionValueResponse {
  @ApiProperty({
    type: String,
    description: 'Sàn giao dịch',
    example: 'VNINDEX',
  })
  exchange: string;

  @ApiProperty({
    type: 'float',
    description: 'Giá đóng sàn',
    example: 263.0218810000001,
  })
  exchange_price: number;

  @ApiProperty({
    type: 'float',
    description: 'Giá trị ròng tự doanh',
    example: 263.0218810000001,
  })
  total_proprietary: number;

  @ApiProperty({
    type: 'float',
    description: 'Giá trị ròng cá nhân',
    example: 3.12,
  })
  total_retail: number;

  @ApiProperty({
    type: 'float',
    description: 'Giá trị ròng khối ngoại',
    example: 12.09,
  })
  total_foreign: number;

  @ApiProperty({
    type: Date,
    example: '2023/02/22',
  })
  date: Date | string;


  constructor(data?: NetTransactionValueResponse) {
    this.exchange = data?.exchange || "";
    this.exchange_price = data?.exchange_price || 0;
    this.total_foreign = data?.total_foreign || 0;
    this.total_proprietary = data?.total_proprietary || 0;
    this.total_retail = data?.total_retail || 0;
    this.date = UtilCommonTemplate.toDate(data?.date) || "2022/02/22"
  }

  public mapToList(data?: NetTransactionValueResponse[]) {
    return data.map((item) => new NetTransactionValueResponse(item));
  }
}
export class NetTransactionValueSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: NetTransactionValueResponse,
    isArray: true,
  })
  data: NetTransactionValueResponse[];
}
