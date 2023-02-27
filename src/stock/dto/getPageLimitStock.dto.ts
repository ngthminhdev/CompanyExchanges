import {ApiProperty} from "@nestjs/swagger";
import {IsNumberString, IsString} from "class-validator";


export class GetPageLimitStockDto {

    @IsNumberString()
    @ApiProperty({
        type: Number,
        example: 1
    })
    page: number

    @IsNumberString()
    @ApiProperty({
        type: Number,
        example: 20
    })
    limit: number

    @IsString({message: 'exchange not found!'})
    @ApiProperty({
        type: String,
        example: 'vnindex'
    })
    exchange: string
}