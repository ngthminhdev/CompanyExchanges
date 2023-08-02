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
        type: Number
    })
    time: number

    constructor(data?: CandleChartResponse) {
        this.openPrice = data?.openPrice || 0
        this.closePrice = data?.closePrice || 0
        this.highPrice = data?.highPrice || 0
        this.lowPrice = data?.lowPrice || 0
        this.totalVol = data?.totalVol || 0
        this.time = moment(`${moment(data.time).utcOffset(420).hour()}:${moment(data.time).utcOffset(420).minute()}`, 'HH:mm').valueOf()
    }


    static mapToList(data?: CandleChartResponse[]) {
        return data.map(item => new CandleChartResponse(item))
    }
}