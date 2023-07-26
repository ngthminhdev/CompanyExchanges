import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class TransactionStatisticsResponse {
    @ApiProperty({
        type: Number
    })
    closePrice: number

    @ApiProperty({
        type: Number
    })
    klgd: number

    @ApiProperty({
        type: Number
    })
    gtdd: number

    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: Number
    })
    change: number

    @ApiProperty({
        type: Number
    })
    perChange: number

    @ApiProperty({
        type: Number
    })
    vh: number

    @ApiProperty({
        type: Number
    })
    nn_mua: number

    @ApiProperty({
        type: Number
    })
    nn_ban: number

    constructor(data?: TransactionStatisticsResponse) {
        this.closePrice = data?.closePrice || 0
        this.klgd = data?.klgd || 0
        this.gtdd = data?.gtdd || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.change = data?.change || 0
        this.perChange = data?.perChange || 0
        this.vh = data?.vh || 0
        this.nn_mua = data?.nn_mua || 0
        this.nn_ban = data?.nn_ban || 0
    }


    static mapToList(data?: TransactionStatisticsResponse[]) {
        return data.map(item => new TransactionStatisticsResponse(item))
    }
}