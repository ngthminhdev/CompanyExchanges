import { ApiProperty } from "@nestjs/swagger"

export class ReportIndexResponse {
    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    d_value: number

    @ApiProperty({
        type: Number
    })
    w_value: number

    @ApiProperty({
        type: Number
    })
    m_value: number

    @ApiProperty({
        type: Number
    })
    y_value: number

    @ApiProperty({
        type: Number
    })
    buy: number

    @ApiProperty({
        type: Number
    })
    sell: number

    @ApiProperty({
        type: Number
    })
    net: number

    constructor(data?: ReportIndexResponse) {
        this.code = data?.code || ''
        this.d_value = data?.d_value || 0
        this.w_value = data?.w_value || 0
        this.m_value = data?.m_value || 0
        this.y_value = data?.y_value || 0
        this.buy = data?.buy || 0
        this.sell = data?.sell || 0
        this.net = data?.net || 0
    }


    static mapToList(data?: ReportIndexResponse[]) {
        return data.map(item => new ReportIndexResponse(item))
    }
}