import {GetExchangeQuery} from "./getExchangeQuery.dto";
import {IsEnum} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetLiquidityQueryDto extends GetExchangeQuery {
    @IsEnum(["0", "1", "2", "3"],{message: 'type not found!'})
    @ApiProperty({
        type: Number,
        example: 0,
        description:
            `<p>
                <div><font color="#228b22">0: </font><font color="gray">Cổ phiếu</font></div>
                <div><font color="#228b22">1: </font><font color="gray">Ngành LV1</font></div>
                <div><font color="#228b22">2: </font><font color="gray">Ngành LV2</font></div>
                <div><font color="#228b22">3: </font><font color="gray">Ngành LV3</font></div>
            </p>`
    })
    type: string;

    @IsEnum(["0", "1", "2", "3"],{message: 'order not found!'})
    @ApiProperty({
        type: Number,
        example: 0,
        description:
            `<p>
                <div><font color="#228b22">0: </font><font color="gray">Phiên gần nhất</font></div>
                <div><font color="#228b22">1: </font><font color="gray">5 phiên</font></div>
                <div><font color="#228b22">2: </font><font color="gray">1 tháng</font></div>
                <div><font color="#228b22">3: </font><font color="gray">Từ đầu năm - YtD</font></div>
            </p>`
    })
    order: string
}