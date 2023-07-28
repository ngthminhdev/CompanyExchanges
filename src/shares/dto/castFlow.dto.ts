import { ApiProperty } from "@nestjs/swagger";
import { StockDto } from "./stock.dto";

export class CastFlowDto extends StockDto {
    @ApiProperty({
        type: Number,
        description: '0 - Quý, 1 - Năm'
    })
    order: number
}