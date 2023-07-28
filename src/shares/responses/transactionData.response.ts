import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class TransactionDataResponse {
    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number
    })
    perChange: number
    
    @ApiProperty({
        type: Number
    })
    change: number

    @ApiProperty({
        type: Number
    })
    closePrice: number

    @ApiProperty({
        type: Number
    })
    totalVol: number

    @ApiProperty({
        type: Number
    })
    omVol: number

    @ApiProperty({
        type: Number
    })
    omVal: number

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
    vh: number

    constructor(data?: TransactionDataResponse) {
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.perChange = data?.perChange || 0
        this.change = data?.change || 0
        this.closePrice = data?.closePrice || 0
        this.totalVol = data?.totalVol || 0
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