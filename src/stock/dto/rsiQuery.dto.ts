import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import { GetExchangeQuery } from './getExchangeQuery.dto';

export class RsiQueryDto extends GetExchangeQuery {
  @IsOptional()
  @IsNumberString({}, { message: 'session not found' })
  @ApiPropertyOptional({
    type: Number,
    example: 20,
    description: 'Số phiên giao dịch',
  })
  session: string;
}
