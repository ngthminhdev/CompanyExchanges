import { ApiProperty } from "@nestjs/swagger"
import { UtilCommonTemplate } from "../../utils/utils.common"

export class MainExportImportResponse {
    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: String,
    })
    date: string

    @ApiProperty({
        type: Number,
        description: 'xuất khẩu'
    })
    xk: number

    @ApiProperty({
        type: Number,
        description: 'nhập khẩu'
    })
    nk: number

    @ApiProperty({
        type: Number,
        description: 'xnk ròng'
    })
    net_xnk: number

    constructor(data?: MainExportImportResponse){
        this.name = data?.name ? `Thị trường chính ${data.name}` : ''
        this.date = data?.date ? UtilCommonTemplate.toDate(data.date) : ''
        this.xk = data?.xk || 0
        this.nk = data?.nk || 0
        this.net_xnk = data?.net_xnk || 0
    }

    static mapToList(data: MainExportImportResponse[]){
        return data.map(item => new MainExportImportResponse(item))
    }
}