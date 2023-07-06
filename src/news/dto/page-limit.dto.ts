import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class PageLimitDto {
    @IsNotEmpty()
    @ApiProperty({
        type: Number
    })
    page: number

    @IsNotEmpty()
    @ApiProperty({
        type: Number
    })
    limit: number
}