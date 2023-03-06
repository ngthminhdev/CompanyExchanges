import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";


export class GetExchangeQuery {
    @IsString({message: 'exchange not found!'})
    @ApiProperty({
        type: String,
        example: 'vnindex'
    })
    exchange: string
}