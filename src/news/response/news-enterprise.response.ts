import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class NewsEnterpriseResponse {
    @ApiProperty({
        type: String
    })
    date: string

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
    code: string

    @ApiProperty({
        type: Number
    })
    closePrice: number

    @ApiProperty({
        type: Number
    })
    perChange: number

    @ApiProperty({
        type: Number
    })
    change: number

    constructor(data?: NewsEnterpriseResponse){
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.title = data?.title || ''
        this.href = data?.href || ''
        this.code = data?.code || ''
        this.closePrice = data?.closePrice || 0
        this.perChange = data?.perChange || 0
        this.change = data?.change || 0
    }

    static mapToList(data?: NewsEnterpriseResponse[]){
        return data.map(item => new NewsEnterpriseResponse(item))
    }
}