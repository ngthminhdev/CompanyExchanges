import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TopNetBuyingAndSellingDto {
    @IsNotEmpty()
    @ApiProperty({
        type: Number,
        description: `0 - Khối ngoại, 1 - Tự doanh`
    })
    type: number
}