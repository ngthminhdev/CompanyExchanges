import { ApiProperty } from "@nestjs/swagger";

export class QueryNewsDto {
    @ApiProperty({
        type: Number,
        default: 7
    })
    quantity: number
}