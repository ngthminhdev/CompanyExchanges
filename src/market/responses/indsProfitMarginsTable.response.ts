import { ApiProperty } from "@nestjs/swagger"

export class IndsProfitMarginsTableResponse {
    @ApiProperty({
        type: String
    })
    industry: string

    @ApiProperty({
        type: Number,
        description: `Tỷ suất lợi nhuận gộp biên`
    })
    gpm: number

    @ApiProperty({
        type: Number,
        description: `Tỷ suất lợi nhuận ròng`
    })
    npm: number

    @ApiProperty({
        type: Number,
        description: `Lợi nhuận trên tài sản`
    })
    roa: number

    @ApiProperty({
        type: Number,
        description: `Lợi nhuận trên VCSH`
    })
    roe: number

    constructor(data?: IndsProfitMarginsTableResponse) {
        this.industry = data?.industry || ''
        this.gpm = data?.gpm || 0
        this.npm = data?.npm || 0
        this.roa = data?.roa || 0
        this.roe = data?.roe || 0
    }


    static mapToList(data?: IndsProfitMarginsTableResponse[]) {
        return data.map(item => new IndsProfitMarginsTableResponse(item))
    }
}