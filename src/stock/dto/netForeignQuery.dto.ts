import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsString} from "class-validator";


export class NetForeignQueryDto {

    @IsString({message: 'exchange not found'})
    @ApiProperty({
        type: String,
        example: 'HNX'
    })
    exchange: string

    @IsEnum(["0","1"], {message: 'transaction not found'})
    @ApiProperty({
        type: Number,
        example: 0
    })
    transaction: number
}