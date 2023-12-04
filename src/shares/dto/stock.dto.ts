import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class StockDto {
    @IsNotEmpty({message: 'stock not found'})
    @IsString()
    @Length(3, 5, {message: 'stock chỉ đc từ 3 đến 5 kí tự'})
    @ApiProperty({
        type: String
    })
    stock: string
}