import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class NewsEventResponse {
    @ApiProperty({
        type: String
    })
    date: string

    @ApiProperty({
        type: String
    })
    date_dkcc: string

    @ApiProperty({
        type: String
    })
    date_gdkhq: string

    @ApiProperty({
        type: String
    })
    exchange: string

    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String
    })
    content: string

    @ApiProperty({
        type: String
    })
    type: string

    total_record: number


    constructor(data: NewsEventResponse){
        this.date =  data?.date ? UtilCommonTemplate.toDateV2(data?.date) : ''
        this.date_dkcc =  UtilCommonTemplate.toDateV2(data?.date_dkcc) || ''
        this.date_gdkhq = UtilCommonTemplate.toDateV2(data?.date_gdkhq) || ''
        this.exchange = data?.exchange ? data?.exchange.toUpperCase() : ''
        this.code = data?.code || ''
        this.content = data?.content || ''
        this.type = data?.type || ''
    }

    static mapToList(data?: NewsEventResponse[]){
        return data.map(item => new NewsEventResponse(item))
    }
}