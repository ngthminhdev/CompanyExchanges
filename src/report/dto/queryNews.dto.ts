import { ApiProperty } from "@nestjs/swagger";

export class QueryNewsDto {
    @ApiProperty({
        type: Number,
        default: 7
    })
    quantity: number

    @ApiProperty({
        type: Number,
        description: `0 - Bản tin sáng chiều, 1 - Bản tin tuần`
    })
    type: number
}