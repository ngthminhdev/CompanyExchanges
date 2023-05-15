import { ApiProperty, ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { UtilCommonTemplate } from '../../utils/utils.common';
import { LineChartInterface } from '../../kafka/interfaces/line-chart.interface';
import { TransactionTimeTypeEnum } from '../../enums/common.enum';
import { LiquidityGrowthInterface } from '../interfaces/liquidity-growth.interface';

export class LiquidityGrowthResponse {
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

  @ApiResponseProperty({
    type: Number,
  })
  roc: number;

  constructor(data?: LiquidityGrowthInterface, roc?: number) {
    this.floor = data?.floor || '';
    this.totalVal = data?.totalVal || 0;
    this.date = UtilCommonTemplate.toDate(data?.date || new Date());
    this.roc = roc || 0;
  }

  public mapToList(data?: LiquidityGrowthInterface[]) {
    let firstTemp = data![0];
    let lastTemp = data![data.length - 1];
    const roc =
      ((firstTemp.totalVal - lastTemp.totalVal) / lastTemp.totalVal) * 100;

    return data.map((i) => new LiquidityGrowthResponse(i, roc));
  }
}

export class VnIndexSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: LiquidityGrowthResponse,
    isArray: true,
  })
  data: LiquidityGrowthResponse[];
}
