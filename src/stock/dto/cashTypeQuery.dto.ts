import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TimestampQueryOnlyDto } from './timestampOnlyQuery.dto';

export class CashTypeQueryDto extends TimestampQueryOnlyDto {
  @IsEnum(['0', '1', '2'], { message: 'investorType not found' })
  @ApiProperty({
    type: Number,
    example: 0,
    description: `<p>
            <div><font color="#228b22">0: </font><font color="gray">Khoi ngoai</font></div>
            <div><font color="#228b22">1: </font><font color="gray">Tu doanh</font></div>
            <div><font color="#228b22">2: </font><font color="gray">Ca nhan</font></div>
        </p>`,
  })
  investorType: string;
}
