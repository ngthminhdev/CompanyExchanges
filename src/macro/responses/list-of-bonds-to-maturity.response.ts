import { ApiProperty } from "@nestjs/swagger"

export class ListOfBondsToMaturityResponse {
    @ApiProperty({
        type: String,
        description: 'Doanh nghiệp'
    })
    name: string

    @ApiProperty({
        type: String,
        description: 'Mã TP'
    })
    code: string

    @ApiProperty({
        type: Number,
        description: 'Kì hạn còn lại'
    })
    khcl: number

    @ApiProperty({
        type: Number,
        description: 'Giá trị phát hành'
    })
    gtph: number

    @ApiProperty({
        type: Number,
        description: 'Giá trị lưu hành'
    })
    gtlh: number

    @ApiProperty({
        type: String,
        description: 'Tổ chức lưu kỳ'
    })
    tclk: string

    constructor(data?: ListOfBondsToMaturityResponse){
        this.name = data?.name || ''
        this.code = data?.code || ''
        this.khcl = data?.khcl || 0
        this.gtph = +data?.gtph || 0
        this.gtlh = +data?.gtlh || 0
        this.tclk = data?.tclk || ''
    }

    static mapToList(data?: ListOfBondsToMaturityResponse[]){
         return data.map(item => new ListOfBondsToMaturityResponse(item))
    }
}