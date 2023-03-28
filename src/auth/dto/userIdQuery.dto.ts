import {ApiProperty} from "@nestjs/swagger";
import {IsNumberString} from "class-validator";


export class UserIdQueryDto {
    @IsNumberString({}, {message: 'userId not found'})
    @ApiProperty({
        type: Number
    })
    userId: number
}