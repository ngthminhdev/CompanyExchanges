import {ApiProperty} from "@nestjs/swagger";
import {IsNumberString} from "class-validator";


export class UserIdParamDto {
    @IsNumberString({}, {message: 'userId not found'})
    @ApiProperty({
        type: Number
    })
    userId: string
}