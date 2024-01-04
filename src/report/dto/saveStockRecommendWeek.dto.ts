import { ApiProperty } from "@nestjs/swagger"

export class ISaveStockRecommendWeek {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number
    })
    gia_khuyen_nghi: number

    @ApiProperty({
        type: Number
    })
    gia_muc_tieu: number

    @ApiProperty({
        type: Number
    })
    gia_dung_lo: number

    @ApiProperty({
        type: Number
    })
    thoi_gian_nam_giu_du_kien: number

    @ApiProperty({
        type: Number
    })
    is_buy: number

    @ApiProperty({
        type: Number
    })
    gia_ban: number

    @ApiProperty({
        type: Number
    })
    thoi_gian_nam_giu: number

    @ApiProperty({
        type: Number
    })
    is_sell: number
}

export class SaveStockRecommendWeekDto {
    @ApiProperty({
        type: ISaveStockRecommendWeek,
        isArray: true
    })
    value: ISaveStockRecommendWeek[]
}