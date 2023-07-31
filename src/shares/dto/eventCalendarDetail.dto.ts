import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { StockDto } from "./stock.dto";

export class EventCalendarDetailDto extends StockDto {
    @IsEnum(['0', '1', '2'], {message: 'type not found'})
    @ApiProperty({
        type: Number,
        description: `0 - của cổ phiếu đó, 1 - Toàn ngành, 2 - Toàn thị trường`
    })
    type: number
}