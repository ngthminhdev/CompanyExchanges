import { ApiProperty } from "@nestjs/swagger"

export class ExchangeRateResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number,
        description: 'Thị giá'
    })
    price: number

    @ApiProperty({
        type: Number,
        description: '%D'
    })
    day: number

    @ApiProperty({
        type: Number,
        description: '%M'
    })
    month: number

    @ApiProperty({
        type: Number,
        description: '%YtD'
    })
    year: number

    @ApiProperty({
        type: String,
        description: 'Hình quốc kì'
    })
    img: string

    constructor(data?: ExchangeRateResponse) {
        this.code = data?.code || ''
        this.price = data?.price || 0
        this.day = +data?.day.toFixed(2) || 0
        this.month = +data?.month.toFixed(2) || 0
        this.year = +data?.year.toFixed(2) || 0
        this.img = `/resources/national/${data.code}.png`
    }

    static mapToList(data?: ExchangeRateResponse[]) {
        return data.map(item => new ExchangeRateResponse(item))
    }
}