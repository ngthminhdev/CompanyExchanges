import { ApiProperty } from "@nestjs/swagger";
import { TimestampQueryDto } from "./timestampQuery.dto";


export class CashTypeQueryDto extends TimestampQueryDto {
    @ApiProperty({
        type: Number,
        example: 0,
        description:
        `<p>
            <div><font color="#228b22">0: </font><font color="gray">Khoi ngoai</font></div>
            <div><font color="#228b22">1: </font><font color="gray">Tu doanh</font></div>
            <div><font color="#228b22">2: </font><font color="gray">Ca nhan</font></div>
        </p>`
    })
    investorType: string

}