import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class TransactionDataResponse {
    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number,
        description: `Thay đổi (%)`
    })
    perChange: number
    
    @ApiProperty({
        type: Number,
        description: `Thay đổi điểm`
    })
    change: number

    @ApiProperty({
        type: Number,
        description: `giá đóng cửa`
    })
    closePrice: number

    @ApiProperty({
        type: Number,
        description: `Tổng KLGD`
    })
    totalVol: number

    @ApiProperty({
        type: Number,
        description: `Tổng GTGD`
    })
    totalVal: number

    @ApiProperty({
        type: Number,
        description: `Khối lượng khớp lệnh`
    })
    omVol: number

    @ApiProperty({
        type: Number,
        description: `giá trị khớp lệnh`
    })
    omVal: number

    @ApiProperty({
        type: Number,
        description: `giá cao nhất`
    })
    highPrice: number

    @ApiProperty({
        type: Number,
        description: `giá thấp nhất`
    })
    lowPrice: number

    @ApiProperty({
        type: Number,
        description: `Vốn hóa`
    })
    vh: number

    constructor(data?: TransactionDataResponse) {
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.perChange = data?.perChange || 0
        this.change = data?.change || 0
        this.closePrice = data?.closePrice || 0
        this.totalVol = data?.totalVol || 0
        this.totalVal = data?.totalVal || 0
        this.omVol = data?.omVol || 0
        this.omVal = data?.omVal || 0
        this.highPrice = data?.highPrice || 0
        this.lowPrice = data?.lowPrice || 0
        this.vh = data?.vh || 0
    }


    static mapToList(data?: TransactionDataResponse[]) {
        return data.map(item => new TransactionDataResponse(item))
    }
}