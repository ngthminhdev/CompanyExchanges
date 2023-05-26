import { ApiProperty } from '@nestjs/swagger';
import { IPriceChangePerformance } from '../interfaces/price-change-performance.interface';

export class PriceChangePerformanceResponse {
  @ApiProperty({
    type: String,
    example: 'ACB',
  })
  code: string;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perFive: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perQuarter: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perYtd: number;

  @ApiProperty({
    type: Number,
    example: 1.5,
  })
  perYtY: number;

  constructor(data?: IPriceChangePerformance) {
    this.code = data?.code || '';
    this.perFive = data?.perFive || 0;
    this.perQuarter = data?.perQuarter || 0;
    this.perYtd = data?.perYtd || 0;
    this.perYtY = data?.perYtY || 0;
  }

  public mapToList(data?: IPriceChangePerformance[]) {
    return data?.map((item) => new PriceChangePerformanceResponse(item));
  }
}

export class PriceChangePerformanceSwagger {
  @ApiProperty({
    type: PriceChangePerformanceResponse,
    isArray: true,
  })
  data: PriceChangePerformanceResponse[];
}
