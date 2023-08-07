import { ApiProperty } from "@nestjs/swagger"

export class ExchangeRateIndexTableResponse {
    @ApiProperty({
        type: String,
        description: `Tỷ giá`
    })
    name: string

    @ApiProperty({
        type: Number,
        description: `Giá hiện tại`
    })
    day_price: number

    @ApiProperty({
        type: Number,
        description: `Thay đổi gần nhất`
    })
    day_change: number

    @ApiProperty({
        type: Number,
        description: `Bình quân trong tháng`
    })
    month_price: number

    @ApiProperty({
        type: Number,
        description: `Thay đổi so với tháng trước nếu số âm hiện đỏ`
    })
    month_change: number

    @ApiProperty({
        type: Number,
        description: `Bình quân trong quý`
    })
    quarter_price: number

    @ApiProperty({
        type: Number,
        description: `Thay đổi so với quý trước nếu số âm hiện đỏ`
    })
    quarter_change: number

    @ApiProperty({
        type: Number,
        description: `Bình quân trong năm`
    })
    year_price: number

    @ApiProperty({
        type: Number,
        description: `Thay đổi so với năm trước nếu số âm hiện đỏ`
    })
    year_change: number

    constructor(data?: any) {
        this.name = data?.name || ''
        this.day_price = data?.day_price || 0
        this.day_change = +data.day_change.slice(data?.day_change.indexOf('(') + 1, data?.day_change.indexOf(')') - 1) || 0
        this.month_price = data?.month_price || 0
        this.month_change = +data.month_change.slice(data?.month_change.indexOf('(') + 1, data?.month_change.indexOf(')') - 1) || 0
        this.quarter_price = data?.quarter_price || 0
        this.quarter_change = +data.quarter_change.slice(data?.quarter_change.indexOf('(') + 1, data?.quarter_change.indexOf(')') - 1) || 0
        this.year_price = data?.year_price || 0
        this.year_change = +data.year_change.slice(data?.year_change.indexOf('(') + 1, data?.year_change.indexOf(')') - 1) || 0
    }


    static mapToList(data?: ExchangeRateIndexTableResponse[]) {
        return data.map(item => new ExchangeRateIndexTableResponse(item))
    }
}