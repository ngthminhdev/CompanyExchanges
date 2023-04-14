import {GetExchangeQuery} from "./getExchangeQuery.dto";
import {IsEnum} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetLiquidityQueryDto extends GetExchangeQuery {
    @IsEnum(["0", "1", "2", "3"],{message: 'type not found!'})
    @ApiProperty({
        type: Number,
        example: 0,
        description: '0 - Cổ phiếu, 1 - Ngành LV1, 2 - Ngành LV2, 3 - Ngành LV3'
    })
    type: string

    @IsEnum(["0"],{message: 'order not found!'})
    @ApiProperty({
        type: Number,
        example: 0,
        description: '0 - 1 ngày, 1 - 5 ngày, 2 - 1 tuần, 3 - YtD'
    })
    order: string
}