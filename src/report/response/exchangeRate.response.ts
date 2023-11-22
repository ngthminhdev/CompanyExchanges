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

    constructor(data?: ExchangeRateResponse) {
        this.code = data?.code || ''
        this.price = data?.price || 0
        this.day = data?.day || 0
        this.month = data?.month || 0
        this.year = data?.year || 0
    }

    static mapToList(data?: ExchangeRateResponse[]) {
        return data.map(item => new ExchangeRateResponse(item))
    }
}