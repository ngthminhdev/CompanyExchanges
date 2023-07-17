import { ApiProperty } from "@nestjs/swagger"

export class ForeignInvestmentIndexResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: Number,
        description: 'Vốn cấp mới'
    })
    cm_usd: number

    @ApiProperty({
        type: Number,
        description: 'Vốn cấp mới trước đó'
    })
    cm_usd_pre: number

    @ApiProperty({
        type: Number,
        description: 'Dự án cấp mới'
    })
    cm: number

    @ApiProperty({
        type: Number,
        description: 'Dự án cấp mới trước đó'
    })
    cm_pre: number

    @ApiProperty({
        type: Number,
        description: 'Vốn tăng vốn'
    })
    tv_usd: number

    @ApiProperty({
        type: Number,
        description: 'Vốn tăng vốn trước đó'
    })
    tv_usd_pre: number

    @ApiProperty({
        type: Number,
        description: 'Lượt dự án tăng vốn'
    })
    tv: number

    @ApiProperty({
        type: Number,
        description: 'Lượt dự án tăng vốn trước đó'
    })
    tv_pre: number

    @ApiProperty({
        type: Number,
        description: 'Vốn góp vốn'
    })
    gv_usd: number

    @ApiProperty({
        type: Number,
        description: 'Vốn góp vốn trước đó'
    })
    gv_usd_pre: number

    @ApiProperty({
        type: Number,
        description: 'Lượt góp vốn'
    })
    gv: number

    @ApiProperty({
        type: Number,
        description: 'Lượt trước đó'
    })
    gv_pre: number

    @ApiProperty({
        type: Number,
        description: 'Tổng vốn'
    })
    total: number

    @ApiProperty({
        type: Number,
        description: 'Tổng vốn trước đó'
    })
    total_pre: number

    constructor(data?: ForeignInvestmentIndexResponse) {
        this.name = data?.name || ''
        this.cm_usd = data?.cm_usd || 0
        this.cm_usd_pre = data?.cm_usd_pre || 0
        this.cm = data?.cm || 0
        this.cm_pre = data?.cm_pre || 0
        this.tv_usd = data?.tv_usd || 0
        this.tv_usd_pre = data?.tv_usd_pre || 0
        this.tv = data?.tv || 0
        this.tv_pre = data?.tv_pre || 0
        this.gv_usd = data?.gv_usd || 0
        this.gv_usd_pre = data?.gv_usd_pre || 0
        this.gv = data?.gv || 0
        this.gv_pre = data?.gv_pre || 0
        this.total = data?.total || 0
        this.total_pre = data?.total_pre || 0
    }

    static mapToList(data?: ForeignInvestmentIndexResponse[]){
        return data.map(item => new ForeignInvestmentIndexResponse(item))
    }
}