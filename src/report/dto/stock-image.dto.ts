import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class StockImageDto {
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Truyền lên một chuỗi code',
        example: 'HPG,SSI,VCB,VNM'
    })
    code: string
}