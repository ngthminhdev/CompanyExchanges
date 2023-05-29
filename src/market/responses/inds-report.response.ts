import { ApiProperty } from '@nestjs/swagger';
import { IndusLiquidityResponse } from './indus-liquidity.response';

export class IndsReportResponse extends IndusLiquidityResponse {
  @ApiProperty({
    type: String,
    example: 'vốn chủ sở hữu',
  })
  report: string;

  constructor(data?: IndsReportResponse) {
    super(data);
    this.date = data?.date.toString() || '';
    this.report = data?.report || '';
  }

  public mapToList(
    data?: IndsReportResponse[],
    type: number = 0,
  ): IndsReportResponse[] {
    return data.map((item) => new IndsReportResponse(item));
  }
}

export class IndsReportSwagger {
  @ApiProperty({
    type: IndsReportResponse,
    isArray: true,
  })
  data: IndsReportResponse[];
}
