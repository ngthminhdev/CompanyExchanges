import { ApiProperty } from '@nestjs/swagger';
import { ISRotationRatio } from '../interfaces/rotation-ratio.interface';

export class RotationRatioResponse {
  @ApiProperty({
    type: String,
    example: 'Hóa chất',
  })
  industry: string;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Vòng quay tài sản cố định',
  })
  FAT: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Vòng quay tiền',
  })
  CTR: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Vòng quay Tổng tài sản',
  })
  ATR: number;

  @ApiProperty({
    type: Number,
    example: 0.609,
    description: 'Vòng quay Vốn chủ sở hữu',
  })
  CT: number;

  @ApiProperty({
    type: Date,
    example: '20231',
  })
  date: Date | string;

  constructor(data?: ISRotationRatio) {
    this.industry = data?.industry || '';
    this.FAT = data?.FAT || 0;
    this.CTR = data?.CTR || 0;
    this.ATR = data?.ATR || 0;
    this.CT = data?.CT || 0;
    this.date = data?.date.toString() || '';
  }

  public mapToList(data?: ISRotationRatio[]) {
    return data?.map((i) => new RotationRatioResponse(i));
  }
}

export class RotationRatioSwagger {
  @ApiProperty({
    type: RotationRatioResponse,
    isArray: true,
  })
  data: RotationRatioResponse[];
}
