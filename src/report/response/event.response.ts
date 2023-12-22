import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class EventResponse {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string

    @ApiProperty({
        type: String
    })
    ticker: string

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: EventResponse){
        this.ticker = data?.ticker || ''
        this.title = data?.title || ''
        this.href = data?.href || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
    }

    static mapToList(data?: EventResponse[]){
         return data.map(item => new EventResponse(item))
    }
}