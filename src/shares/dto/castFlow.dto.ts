import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { StockDto } from "./stock.dto";

export class CastFlowDto extends StockDto {
    @IsEnum(['0', '1', '2'], {message: 'order not found'})
    @ApiProperty({
        type: Number,
        description: '0 - Quý, 1 - Năm, 2 - Tháng'
    })
    order: number

    @ApiPropertyOptional({
        type: Number,
        description: `0 - table, 1 - chart`
    })
    is_chart: number
}