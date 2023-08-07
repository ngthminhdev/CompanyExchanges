import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class InterestRateResponse {
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

    constructor(data?: InterestRateResponse) {
        this.name = data?.name ? data.name.slice(data?.name.indexOf('(') + 1, data?.name.indexOf(')')) : ''
        this.value = data?.value || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
    }

    static mapToList(data?: InterestRateResponse[]) {
        return data.map(item => new InterestRateResponse(item))
    }
}