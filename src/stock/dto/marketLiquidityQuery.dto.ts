import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";


export class MarketLiquidityQueryDto {
    @IsEnum(["0","1","2","3","-1"], {message: 'order not found'})
    @ApiProperty({
        type: Number,
        example: 0,
        description: '0 - Tăng mạnh nhất, 1 - Giảm mạnh nhất, 2 - Đóng góp cao nhất, 3 - Đóng góp thấp nhất'
    })
    order: number
}