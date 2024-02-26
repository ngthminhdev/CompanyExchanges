import { ApiProperty } from "@nestjs/swagger";

export class SetInfoReportTechnicalDto {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String,
        isArray: true
    })
    text: string[]

    @ApiProperty({
        isArray: true,
        description: 'Bảng các chỉ số hỗ trợ'
    })
    table: any[]

    @ApiProperty({
        description: 'Hình biểu đô giá'
    })
    img: any

    @ApiProperty({
        type: Number,
        description: 'Khuyến nghị mua hoặc bán'
    })
    is_sell: number

    @ApiProperty({
        type: Number
    })
    gia_muc_tieu: number

    @ApiProperty({
        type: Number
    })
    gia_thi_truong: number

    @ApiProperty({
        type: Number
    })
    loi_nhuan_ky_vong: number

    @ApiProperty({
        type: Number
    })
    gia_ban_dung_lo: number

}