import { ApiProperty } from "@nestjs/swagger"

export class NewsEnterpriseResponse {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string

    ticker: string
    constructor(data?: NewsEnterpriseResponse){
        this.title = data?.title ? data?.ticker + ': ' + data?.title : ''
        this.href = data?.href || ''
    }

    static mapToList(data?: NewsEnterpriseResponse[]){
         return data.map(item => new NewsEnterpriseResponse(item))
    }
}