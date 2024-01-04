import { ApiProperty } from "@nestjs/swagger"

export class NewsInternationalResponse {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    sub_title: string

    @ApiProperty({
        type: String
    })
    href: string

    constructor(data?: NewsInternationalResponse){
        this.title = data?.title || ''
        this.sub_title = data?.sub_title || ''
        this.href = data?.href || ''
    }

    static mapToList(data?: NewsInternationalResponse[]){
         return data.map(item => new NewsInternationalResponse(item))
    }
}