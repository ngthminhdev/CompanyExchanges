import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { StockDto } from "./stock.dto";

export class TransactionDataDto extends StockDto {
    @IsString()
    @ApiProperty({
        type: String,
        example: '2023-07-22'
    })
    from: string

    @IsString()
    @ApiProperty({
        type: String,
        example: '2023-07-27'
    })
    to: string
}