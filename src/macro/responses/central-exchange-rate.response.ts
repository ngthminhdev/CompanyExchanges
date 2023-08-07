import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class CentralExchangeRateResponse {
    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: String
    })
    color: string

    constructor(data?: CentralExchangeRateResponse) {
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.color = '#0285A1'
    }

    static mapToList(data?: CentralExchangeRateResponse[]) {
        return data.map(item => new CentralExchangeRateResponse(item))
    }
}