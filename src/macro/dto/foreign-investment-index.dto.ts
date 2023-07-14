import { ApiProperty } from "@nestjs/swagger";
import { FDIOrderDto } from "./fdi-order.dto";

export class ForeignInvestmentIndexDto extends FDIOrderDto {
    @ApiProperty({
        type: Number,
        description: `0 - Đối tác, 1 - Ngành`
    })
    type: number
}