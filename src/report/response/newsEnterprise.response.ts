import { ApiProperty } from "@nestjs/swagger"

export class NewsEnterpriseResponse {
    @ApiProperty({
        type: String
    })
    ticker: string

    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string

    constructor(data?: NewsEnterpriseResponse){
        this.ticker = data?.ticker || ''
        this.title = data?.title || ''
        this.href = data?.href || ''
    }

    static mapToList(data?: NewsEnterpriseResponse[]){
         return data.map(item => new NewsEnterpriseResponse(item))
    }
}