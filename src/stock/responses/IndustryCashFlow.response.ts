import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import { UtilCommonTemplate } from '../../utils/utils.common';

export class IndustryCashFlowResponse {
  @ApiProperty({
    type: String,
    example: 'Bảo hiểm',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  foreignPerChange: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  proprietaryPerChange: number;

  @ApiProperty({
    type: Number,
    example: 0.9,
  })
  retailPerChange: number;

  @ApiProperty({
    type: Date,
    example: 1502.9,
  })
  date: Date | string;

  constructor(data?: any) {
    this.industry = data?.industry || '';
    this.foreignPerChange = data?.foreignPerChange || 0;
    this.proprietaryPerChange = data?.proprietaryPerChange || 0;
    this.retailPerChange = data?.retailPerChange || 0;
    this.date = UtilCommonTemplate.toDate(data?.date) || '';
  }

  public mapToList(data?: any[]) {
    return data?.map((i) => new IndustryCashFlowResponse(i));
  }
}

export class IndustryCashFlowSwagger extends PartialType(BaseResponse) {
  @ApiProperty({
    type: IndustryCashFlowResponse,
    isArray: true,
  })
  data: IndustryCashFlowResponse[];
}
