import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class TradingGroupsInvestorsResponse {
    @ApiProperty({
        type: Number,
        description: `Chỉ số giá của sàn có chứa cổ phiếu`
    })
    price_exchange: number

    @ApiProperty({
        type: Number,
        description: `KLGD khối ngoại`
    })
    kn: number

    @ApiProperty({
        type: Number,
        description: `KLGD tự doanh`
    })
    td: number

    @ApiProperty({
        type: Number,
        description: `KLGD cá nhân`
    })
    cn: number

    @ApiProperty({
        type: String,
        description: `Chỉ số giá của sàn có chứa cổ phiếu`
    })
    date: string

    @ApiProperty({
        type: Number,
        description: `Chỉ số giá cổ phiếu`
    })
    price: number

    constructor(data?: TradingGroupsInvestorsResponse) {
        this.price_exchange = data?.price_exchange || 0
        this.kn = data?.kn || 0
        this.td = data?.td || 0
        this.cn = data?.cn || 0
        this.date = data?.date ? UtilCommonTemplate.toDate(data?.date) : ''
        this.price = data?.price || 0
    }

    static mapToList(data?: TradingGroupsInvestorsResponse[]) {
        return data.map(item => new TradingGroupsInvestorsResponse(item))
    }
}