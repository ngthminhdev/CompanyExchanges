import { ApiProperty } from "@nestjs/swagger"

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

    constructor(data?: EventResponse){
        this.ticker = data?.ticker || ''
        this.title = data?.title || ''
        this.href = data?.href || ''
    }

    static mapToList(data?: EventResponse[]){
         return data.map(item => new EventResponse(item))
    }
}