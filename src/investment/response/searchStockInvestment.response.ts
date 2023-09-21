import { ApiProperty } from "@nestjs/swagger"

export class InvestmentSearchResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: String
    })
    floor: string

    @ApiProperty({
        type: String
    })
    company_name: string

    constructor(data?: InvestmentSearchResponse) {
        this.code = data?.code || ''
        this.floor = data?.floor || ''
        this.company_name = data?.company_name || ''
    }

    static mapToList(data?: InvestmentSearchResponse[]) {
        return data.map(item => new InvestmentSearchResponse(item))
    }
}