import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { PageLimitDto } from "./page-limit.dto";

export class EventDto extends PageLimitDto {
    @IsString()
    @ApiProperty({
        type: String
    })
    exchange: string
}