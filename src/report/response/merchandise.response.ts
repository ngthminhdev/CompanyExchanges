import { ApiProperty } from "@nestjs/swagger"

export class MerchandiseResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number,
        description: 'Thị giá'
    })
    price: number

    @ApiProperty({
        type: Number,
        description: '%D'
    })
    day: number

    @ApiProperty({
        type: Number,
        description: '%M'
    })
    month: number

    @ApiProperty({
        type: Number,
        description: '%YoY'
    })
    year: number

    @ApiProperty({
        type: Number,
        description: '%YtD'
    })
    ytd: number

    constructor(data?: any) {
        this.name = data?.name || ''
        this.price = data?.price || 0
        this.day = data?.day || 0
        this.month = data?.month || 0
        this.year = data?.year || 0
        this.ytd = data?.ytd || 0
    }

    static mapToList(data?: MerchandiseResponse[]) {
        return data.map(item => new MerchandiseResponse(item))
    }

    static getPercent(str: string) {
        let startIndex = str.indexOf('(') + 1;
        let endIndex = str.indexOf(')') - 1;
        
        return +str.substring(startIndex, endIndex);
    }
}