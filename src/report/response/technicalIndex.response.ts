import { ApiProperty } from "@nestjs/swagger"
import { Any } from "typeorm"

class ITechValue {
    @ApiProperty({
        type: 'any'
    })
    value: number | any

    @ApiProperty({
        type: String
    })
    rate: string

    @ApiProperty({
        type: 'any',
        isArray: true
    })
    chart: any[]
}

class ITechTable {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    single: string

    @ApiProperty({
        type: String
    })
    hat: string
}

class ITechRate {
    @ApiProperty({
        type: Number
    })
    positive: number

    @ApiProperty({
        type: Number
    })
    negative: number

    @ApiProperty({
        type: Number
    })
    neutral: number
}

export class TechnicalIndexResponse {
    @ApiProperty({
        type: ITechValue
    })
    rsi: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    stochastic: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    cci: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    stochasticRsi: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    williams: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    macd: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    adx: ITechValue

    @ApiProperty({
        type: ITechValue
    })
    macdHistogram: ITechValue

    @ApiProperty({
        type: ITechTable,
        isArray: true
    })
    table: ITechTable[]

    @ApiProperty({
        type: ITechRate
    })
    technicalSignal: ITechRate

    @ApiProperty({
        type: ITechRate
    })
    trendSignal: ITechRate

    @ApiProperty({
        type: ITechRate
    })
    generalSignal: ITechRate
}