import { ApiProperty } from "@nestjs/swagger"

class IChart {
    @ApiProperty({
        type: Number
    })
    time: number

    @ApiProperty({
        type: Number
    })
    value: number
}
export class MorningResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    change: number

    @ApiProperty({
        type: Number
    })
    perChange: number

    @ApiProperty({
        type: IChart,
        isArray: true
    })
    chart: IChart[]

    constructor(data?: MorningResponse){
        this.code = data?.code || ''
        this.change = data?.change || 0
        this.perChange = data?.perChange || 0
        this.chart = data?.chart || []
    }

    static mapToList(data?: MorningResponse[]){
         return data.map(item => new MorningResponse(item))
    }
}