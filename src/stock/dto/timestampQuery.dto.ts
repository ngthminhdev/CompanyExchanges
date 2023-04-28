import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";
import {IndexQueryDto} from "./indexQuery.dto";

export class TimestampQueryDto extends IndexQueryDto {
    @IsEnum(["0","1","2","3"], {message: 'type not found'})
    @ApiProperty({
        type: Number,
        description: '0 - phiên hiện tại/ gần nhất, 1 - 5 phiên, 2 - 1 tháng, 3 - YtD'
    })
    type: string
}