import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class EventCalendarResponse {
    @ApiProperty({
        type: String
    })
    content: string

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: EventCalendarResponse){
        this.content = data?.content || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
    }

    static mapToList(data?: EventCalendarResponse[]){
         return data.map(item => new EventCalendarResponse(item))
    }
}