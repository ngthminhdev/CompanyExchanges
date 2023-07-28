import { ApiProperty } from "@nestjs/swagger"

export class TradingPriceFluctuationsResponse {
    @ApiProperty({
        type: Number
    })
    min_price: number

    @ApiProperty({
        type: Number
    })
    max_price: number

    @ApiProperty({
        type: Number
    })
    p_week: number

    @ApiProperty({
        type: Number
    })
    p_month: number

    @ApiProperty({
        type: Number
    })
    p_quarter: number

    @ApiProperty({
        type: Number
    })
    p_year: number

    constructor(data?: TradingPriceFluctuationsResponse) {
        this.min_price = data?.min_price || 0
        this.max_price = data?.max_price || 0
        this.p_week = data?.p_week || 0
        this.p_month = data?.p_month || 0
        this.p_quarter = data?.p_quarter || 0
        this.p_year = data?.p_year || 0
    }
}