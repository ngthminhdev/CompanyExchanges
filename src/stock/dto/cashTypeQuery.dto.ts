import { ApiProperty } from '@nestjs/swagger';
import { TimestampQueryDto } from './timestampQuery.dto';
import { IsEnum } from 'class-validator';

export class CashTypeQueryDto {
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

  @IsEnum(['0', '1', '2', '3'], { message: 'type not found' })
  @ApiProperty({
    type: Number,
    description:
      '0 - phiên hiện tại/ gần nhất, 1 - 5 phiên, 2 - 1 tháng, 3 - YtD',
  })
  type: string;
}
