import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { StockDto } from "./stock.dto";

export class StockTypeDto extends StockDto {
    @IsNotEmpty()
    @ApiProperty({
        type: String
    })
    type: string
}