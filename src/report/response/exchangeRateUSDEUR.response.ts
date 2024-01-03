import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class ExchangeRateUSDEURResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: ExchangeRateUSDEURResponse){
        this.name = data?.name || ''
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
    }

    static mapToList(data?: ExchangeRateUSDEURResponse[]){
         return data.map(item => new ExchangeRateUSDEURResponse(item))
    }
}