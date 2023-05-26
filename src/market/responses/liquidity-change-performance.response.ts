import { ApiProperty } from '@nestjs/swagger';

export class LiquidityChangePerformanceResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perQuarter: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perQuarterLastYear: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perFourYear: number;

  constructor(data?: any) {
    this.code = data?.code || '';
    this.perQuarter = data?.perQuarter || 0;
    this.perQuarterLastYear = data?.perQuarterLastYear || 0;
    this.perFourYear = data?.perFourYear || 0;
  }

  public mapToList(data?: any[]) {
    return data?.map((item) => new LiquidityChangePerformanceResponse(item));
  }
}

export class LiquidityChangePerformanceSwagger {
  @ApiProperty({
    type: LiquidityChangePerformanceResponse,
    isArray: true,
  })
  data: LiquidityChangePerformanceResponse[];
}
