import { ApiProperty } from "@nestjs/swagger";

export class SearchStockDto {
    @ApiProperty({
        type: String
    })
    key_search: string
}