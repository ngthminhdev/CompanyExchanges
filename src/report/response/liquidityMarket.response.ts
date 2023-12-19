import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class LiquidityMarketResponse {
    @ApiProperty({
        type: Number
    })
    value: number

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: LiquidityMarketResponse) {
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
    }

    static mapToList(data?: LiquidityMarketResponse[]) {
        return data.map(item => new LiquidityMarketResponse(item))
    }
}