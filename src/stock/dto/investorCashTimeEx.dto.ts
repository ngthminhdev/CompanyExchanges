import { ApiProperty } from '@nestjs/swagger';
import { CashTypeQueryDto } from './cashTypeQuery.dto';
import { IsString } from 'class-validator';

export class InvestorCashTimeExDto extends CashTypeQueryDto {
  @IsString({ message: 'exchange not found!' })
  @ApiProperty({
    type: String,
    example: 'HNX',
  })
  exchange: string;
}
