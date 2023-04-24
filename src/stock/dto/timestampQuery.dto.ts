import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";

export class TimestampQueryDto {
    @IsEnum(["1","2","3"], {message: 'type not found'})
    @ApiProperty({
        type: Number,
        description: '1 - 5 phiên, 2 - 1 tháng, 3 - YtD'
    })
    type: string
}