import { ApiProperty } from "@nestjs/swagger"

export class IStockTopScore {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    point: number
}

export class TopScoreResponse {
    @ApiProperty({
        type: IStockTopScore,
        isArray: true
    })
    stock_advance: IStockTopScore[]

    @ApiProperty({
        type: IStockTopScore,
        isArray: true
    })
    stock_decline: IStockTopScore[]

    @ApiProperty({
        type: Number
    })
    change: number

    @ApiProperty({
        type: Number
    })
    perChange: number

    @ApiProperty({
        type: Number
    })
    totalVal: number

    @ApiProperty({
        type: Number
    })
    perChangeVal: number

    @ApiProperty({
        type: Number
    })
    noChange: number

    @ApiProperty({
        type: Number
    })
    decline: number

    @ApiProperty({
        type: Number
    })
    advance: number

    constructor(data?: TopScoreResponse){
        this.stock_advance = data?.stock_advance || []
        this.stock_decline = data?.stock_decline || []
        this.change = data?.change || 0
        this.perChange = data?.perChange || 0
        this.totalVal = data?.totalVal || 0
        this.perChangeVal = data?.perChangeVal || 0
        this.noChange = data?.noChange || 0
        this.decline = data?.decline || 0
        this.advance = data?.advance || 0 
    }

    static mapToList(data?: TopScoreResponse[]){
         return data.map(item => new TopScoreResponse(item))
    }
}