import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";


export class MerchandisePriceQueryDto {
    @IsEnum(["0","1", "-1"], {message: 'type not found'})
    @ApiProperty({
        enum: [0,1],
        type: Number,
        example: 0,
        description: '0 - Giá hàng hóa, 1 - Tỉ giá tiền'
    })
    type: number
}