import { ApiProperty } from "@nestjs/swagger"

export class TotalOutstandingBalanceResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number,
        description: 'Tổng dư nợ'
    })
    total: number

    @ApiProperty({
        type: Number,
        description: 'Lãi suất TP bình quân'
    })
    interest_rate: number

    constructor(data?: TotalOutstandingBalanceResponse){
        this.name = data?.name || ''
        this.total = +data?.total || 0
        this.interest_rate = data?.interest_rate || 0 
    }

    static mapToList(data?: TotalOutstandingBalanceResponse[]){
         return data.map(item => new TotalOutstandingBalanceResponse(item))
    }
}