import { ApiProperty } from "@nestjs/swagger";

export class IdentifyMarketDto {
    @ApiProperty({
        type: String,
        isArray: true
    })
    text: string[]
}

export class IStockRecommend {
    @ApiProperty({
        type: String
    })
    code: string

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
    Gia_ngung_lo: number

    @ApiProperty({
        type: Number
    })
    lai_suat: number

    @ApiProperty({
        type: String
    })
    thoi_gian: string

}

export class SaveStockRecommendDto {
    @ApiProperty({
        type: IStockRecommend,
        isArray: true
    })
    stock: IStockRecommend[]
}