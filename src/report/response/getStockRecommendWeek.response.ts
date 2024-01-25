import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class GetStockRecommendWeekResponse {
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
    gia_khuyen_nghi: string | number

    @ApiProperty({
        type: Number
    })
    gia_muc_tieu: string | number

    @ApiProperty({
        type: Number
    })
    gia_dung_lo: string | number

    @ApiProperty({
        type: Number
    })
    ty_suat_sinh_loi_ky_vong: string | number

    @ApiProperty({
        type: String
    })
    thoi_gian_nam_giu_du_kien: string

    @ApiProperty({
        type: String
    })
    ghi_chu: string

    @ApiProperty({
        type: Number
    })
    gia_thi_truong: string | number

    @ApiProperty({
        type: Number
    })
    ty_suat_loi_nhuan: string | number

    @ApiProperty({
        type: Number
    })
    gia_ban: string | number

    @ApiProperty({
        type: Number
    })
    ty_suat_sinh_loi_lo: string | number

    @ApiProperty({
        type: String
    })
    thoi_gian_nam_giu: string

    @ApiProperty({
        type: String
    })
    ghi_chu_2: string

    constructor(data?: GetStockRecommendWeekResponse) {
        this.code = data?.code || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.gia_khuyen_nghi = +data?.gia_khuyen_nghi || 0
        this.gia_muc_tieu = +data?.gia_muc_tieu || 0
        this.gia_dung_lo = +data?.gia_dung_lo || 0
        this.ty_suat_sinh_loi_ky_vong = +data?.ty_suat_sinh_loi_ky_vong || 0
        this.thoi_gian_nam_giu_du_kien = data?.thoi_gian_nam_giu_du_kien || ''
        this.ghi_chu = data?.ghi_chu || ''
        this.gia_thi_truong = +data?.gia_thi_truong || 0
        this.ty_suat_loi_nhuan = +data?.ty_suat_loi_nhuan || 0
        this.gia_ban = +data?.gia_ban || 0
        this.ty_suat_sinh_loi_lo = +data?.ty_suat_sinh_loi_lo || 0
        this.thoi_gian_nam_giu = data?.thoi_gian_nam_giu || ''
        this.ghi_chu_2 = data?.ghi_chu_2 || ''
    }

    static mapToList(data?: GetStockRecommendWeekResponse[]) {
        return data.map(item => new GetStockRecommendWeekResponse(item))
    }
}