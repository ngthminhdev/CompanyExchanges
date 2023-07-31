import { ApiProperty } from "@nestjs/swagger"

export class NewsStockResponse {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string

    constructor(data?: NewsStockResponse) {
        this.title = data?.title || ''
        this.href = data?.href || ''
    }


    static mapToList(data?: NewsStockResponse[]) {
        return data.map(item => new NewsStockResponse(item))
    }
}