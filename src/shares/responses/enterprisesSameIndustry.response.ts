import { ApiProperty } from "@nestjs/swagger"

export class EnterprisesSameIndustryResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    closePrice: number

    @ApiProperty({
        type: Number
    })
    kl: number

    @ApiProperty({
        type: Number
    })
    pe: number

    @ApiProperty({
        type: Number
    })
    pb: number

    @ApiProperty({
        type: Number
    })
    vh: number

    constructor(data?: EnterprisesSameIndustryResponse){
        this.code = data?.code || ''
        this.closePrice = data?.closePrice || 0
        this.kl = data?.kl || 0
        this.pe = data?.pe || 0
        this.pb = data?.pb || 0
        this.vh = data?.vh || 0
    }

    static mapToList(data?: EnterprisesSameIndustryResponse[]){
         return data.map(item => new EnterprisesSameIndustryResponse(item))
    }
}