import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class NewsFilterResponse {
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
    date: string

    @ApiProperty({
        type: String
    })
    img: string

    @ApiProperty({
        type: String
    })
    code: string

    constructor(data?: NewsFilterResponse){
        this.title = data?.title || ''
        this.href = data?.href || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.img = data?.img || ''
        this.code = data?.code || '' 
    }

    static mapToList(data?: NewsFilterResponse[]){
        return data.map(item => new NewsFilterResponse(item))
    }
} 