import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class BuyingAndSellingStatisticsResponse {
    @ApiProperty({
        type: Number
    })
    buy: number

    @ApiProperty({
        type: Number
    })
    sell: number

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: BuyingAndSellingStatisticsResponse){
        this.buy = data?.buy || 0
        this.sell = data?.sell || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : '' 
    }

    static mapToList(data?: BuyingAndSellingStatisticsResponse[]){
         return data.map(item => new BuyingAndSellingStatisticsResponse(item))
    }
}