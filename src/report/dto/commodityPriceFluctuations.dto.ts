import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class CommodityPriceFluctuationsDto {
    @IsEnum(['0', '1', '2', '3', '4', '5'])
    @ApiProperty({
        type: Number,
        description:`
        0 - Giá dầu Brent và giá khí tự nhiên,
        1 - Giá Đồng và giá Vàng,
        2 - Giá Thép HRC và giá Thép,
        3 - Giá Cotton và giá Đường,
        4 - Giá Cao su và giá Ure,
        5 - Chỉ số DXY và U.S.10Y
        `
    })
    type: number
}