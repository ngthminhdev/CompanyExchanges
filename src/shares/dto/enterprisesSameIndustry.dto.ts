import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { StockDto } from "./stock.dto";

export class EnterprisesSameIndustryDto extends StockDto {
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: `hnx`
    })
    exchange: string
}