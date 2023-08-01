import { ApiProperty } from "@nestjs/swagger"
import * as moment from "moment"

export class CandleChartResponse {
    @ApiProperty({
        type: Number
    })
    openPrice: number

    @ApiProperty({
        type: Number
    })
    closePrice: number

    @ApiProperty({
        type: Number
    })
    highPrice: number

    @ApiProperty({
        type: Number
    })
    lowPrice: number

    @ApiProperty({
        type: Number
    })
    totalVol: number

    @ApiProperty({
        type: String
    })
    time: string

    constructor(data?: CandleChartResponse) {
        this.openPrice = data?.openPrice || 0
        this.closePrice = data?.closePrice || 0
        this.highPrice = data?.highPrice || 0
        this.lowPrice = data?.lowPrice || 0
        this.totalVol = data?.totalVol || 0
        this.time = data?.time ? moment(data.time).utcOffset("+00:00").format('HH:mm:ss') : ''
    }


    static mapToList(data?: CandleChartResponse[]) {
        return data.map(item => new CandleChartResponse(item))
    }
}