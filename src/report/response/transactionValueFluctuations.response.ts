import { ApiProperty } from "@nestjs/swagger"

export class TransactionValueFluctuationsResponse {

    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    totalVal: number

    @ApiProperty({
        type: Number
    })
    prevTotalVal: number

    @ApiProperty({
        type: Number
    })
    avgTotalVal: number

    constructor(data?: TransactionValueFluctuationsResponse) {
        this.code = data?.code || ''
        this.totalVal = data?.totalVal || 0
        this.prevTotalVal = data?.prevTotalVal || 0
        this.avgTotalVal = data?.avgTotalVal || 0
    }

    static mapToList(data?: TransactionValueFluctuationsResponse[]) {
        return data.map(item => new TransactionValueFluctuationsResponse(item))
    }
}