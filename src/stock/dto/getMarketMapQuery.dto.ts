import {GetExchangeQuery} from "./getExchangeQuery.dto";
import {IsEnum, IsString} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";


export class GetMarketMapQueryDto extends GetExchangeQuery {
    @IsEnum(["0", "1", "2", "3"],{message: 'order not found!'})
    @ApiProperty({
        type: Number,
        example: 0,
        description: '0 - Vốn hóa, 1 - Giá trị GD, 2 - Khối Lượng GD, 3 - Giá Trị NN GD:'
    })
    order: string
}