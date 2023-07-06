import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class MacroDomesticResponse {
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
    img: string

    @ApiProperty({
        type: String
    })
    sub_title: string

    constructor(data?: MacroDomesticResponse){
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.title = data?.title || ''
        this.href = data?.href || ''
        this.img = data?.img || ''
        this.sub_title = data?.sub_title || ''
    }

    static mapToList(data?: MacroDomesticResponse[]){
        return data.map(item => new MacroDomesticResponse(item))
    }
}