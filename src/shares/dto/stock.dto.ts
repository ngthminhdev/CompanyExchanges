import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class StockDto {
    @IsNotEmpty({message: 'stock not found'})
    @ApiProperty({
        type: String
    })
    stock: string
}