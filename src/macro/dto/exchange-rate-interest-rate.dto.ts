import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ExchangeRateAndInterestRateDto {
    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        description: `0 - Chỉ số VN-INDEX, 1 - % VN-INDEX`
    })
    type: number

    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        description: `0 - Tỷ giá, 1 - Lãi suất`
    })
    category: number
}