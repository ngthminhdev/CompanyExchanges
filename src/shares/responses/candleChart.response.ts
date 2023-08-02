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
        this.time = data?.time ? Date.UTC(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            new Date(data?.time)?.getHours(),
            new Date(data?.time)?.getMinutes(),
          ).valueOf() : 0
    }


    static mapToList(data?: CandleChartResponse[]) {
        return data.map(item => new CandleChartResponse(item))
    }
}