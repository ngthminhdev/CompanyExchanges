import { ApiProperty } from "@nestjs/swagger"
import * as moment from "moment"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class StatisticsMonthQuarterYearResponse {
    @ApiProperty({
        type: Number,
        description: `Tổng GT khớp lệnh`
    })
    omVal: number

    @ApiProperty({
        type: Number,
        description: `Tổng khối lượng khớp lệnh`
    })
    omVol: number

    @ApiProperty({
        type: Number,
        description: `Tổng KL thoả thuận`
    })
    ptVol: number

    @ApiProperty({
        type: Number,
        description: `Tổng GT thỏa thuận`
    })
    ptVal: number

    @ApiProperty({
        type: Number,
        description: `Tổng số phiên `
    })
    total: number

    @ApiProperty({
        type: String
    })
    date: string

    constructor(data?: StatisticsMonthQuarterYearResponse) {
        this.omVal = data?.omVal || 0
        this.omVol = data?.omVol || 0
        this.ptVol = data?.ptVol || 0
        this.ptVal = data?.ptVal || 0
        this.total = data?.total || 0
        this.date = data?.date ? moment(data?.date, 'D/M/YYYY').format('YYYY/MM/DD') : ''
    }


    static mapToList(data?: StatisticsMonthQuarterYearResponse[]) {
        return data.map(item => new StatisticsMonthQuarterYearResponse(item))
    }
}