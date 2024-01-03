import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class EventResponse {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string

    @ApiProperty({
        type: String
    })
    ticker: string

    @ApiProperty({
        type: String,
        description: 'Ngày GHKHQ'
    })
    date: string

    @ApiProperty({
        type: String,
        description: 'Ngày thực hiện'
    })
    NgayThucHien: string

    @ApiProperty({
        type: String,
        description: 'Ngày ĐKCC'
    })
    NgayDKCC: string

    @ApiProperty({
        type: String,
        description: 'Sàn'
    })
    floor: string

    constructor(data?: EventResponse) {
        this.ticker = data?.ticker || ''
        this.floor = data?.floor || ''
        this.title = data?.title || ''
        this.href = data?.href || ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.NgayThucHien = data?.NgayThucHien ? UtilCommonTemplate.toDate(data?.NgayThucHien) : '' 
        this.NgayDKCC = data?.NgayDKCC ? UtilCommonTemplate.toDate(data?.NgayDKCC) : '' 
    }

    static mapToList(data?: EventResponse[]) {
        return data.map(item => new EventResponse(item))
    }
}