import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString } from "class-validator";
import { StockDto } from "./stock.dto";

export class TransactionDataDto extends StockDto {
    @IsString()
    @IsDateString()
    @ApiProperty({
        type: String,
        example: '2023-07-22'
    })
    from: string

    @IsString()
    @IsDateString()
    @ApiProperty({
        type: String,
        example: '2023-07-27'
    })
    to: string
}