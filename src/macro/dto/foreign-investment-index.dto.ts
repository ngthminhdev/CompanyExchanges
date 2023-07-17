import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { FDIOrderDto } from "./fdi-order.dto";

export class ForeignInvestmentIndexDto extends FDIOrderDto {
    @IsEnum(['1', '2'], {message: 'type invalid'})
    @ApiProperty({
        type: Number,
        description: `0 - Đối tác, 1 - Ngành`
    })
    type: number
}