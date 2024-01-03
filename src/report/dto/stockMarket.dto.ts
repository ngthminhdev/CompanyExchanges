import { ApiProperty } from "@nestjs/swagger";

export class StockMarketDto {
    @ApiProperty({
        type: Number,
        description: `0 - bản tin sáng, 1 - bản tin tuần`
    })
    type: number //0 - sáng, 1 - tuần
}