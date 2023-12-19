import { ApiProperty } from "@nestjs/swagger"

export class StockMarketResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number
    })
    price: number

    @ApiProperty({
        type: Number
    })
    day: number

    @ApiProperty({
        type: Number
    })
    month: number

    @ApiProperty({
        type: Number
    })
    year: number

    @ApiProperty({
        type: Number
    })
    ytd: number

    code: string

    constructor(data?: StockMarketResponse) {
        this.name = data?.code || ''
        this.price = data?.price || 0
        this.day = +data?.day.toFixed(2) || 0
        this.month = +data?.month.toFixed(2) || 0
        this.year = +data?.year.toFixed(2) || 0
        this.ytd = +data?.ytd.toFixed(2) || 0
    }

    static mapToList(data?: StockMarketResponse[]) {
        return data.map(item => new StockMarketResponse(item))
    }
}

class StockMarketAfternoon extends StockMarketResponse {
    @ApiProperty({
        type: Number
    })
    week: number

    @ApiProperty({
        type: Number
    })
    totalVal: number

    constructor(data: any) {
        // Gọi hàm khởi tạo của lớp cha bằng từ khóa super
        super(data)
        this.week = data?.week || 0
        this.totalVal = data?.totalVal || 0
    }

    static mapToList(data: any[]){
        return data.map(item => new StockMarketAfternoon(item))
    }
}

export class AfterNoonReport2Response {
    @ApiProperty({
        type: StockMarketAfternoon,
        isArray: true
    })
    table: StockMarketAfternoon[]

    @ApiProperty({
        type: String
    })
    image: string

    @ApiProperty({
        type: String,
        isArray: true
    })
    text: string[]

    constructor(data: any){
        this.table = data?.table ? StockMarketAfternoon.mapToList(data.table) : []
        this.image = data?.image || ''
        this.text = data?.text || []
    }
}