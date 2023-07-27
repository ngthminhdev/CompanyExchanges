import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { StockDto } from "./stock.dto";

export class StockOrderDto extends StockDto {
    @IsEnum(['0', '1'], {message: 'order not found'})
    @ApiProperty({
        type: Number,
        description: `0 - Quý, 1 - Năm`
    })
    order: number

    @IsString()
    @ApiProperty({
        type: String,
        example: 'CTCP'
    })
    type: string
}