import { ApiProperty } from "@nestjs/swagger"

export class MapImportExportResponse {
    @ApiProperty({
        type: String,
    })
    name: string

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

    constructor(data?: MapImportExportResponse){
        this.name = data?.name ? `Thị trường chính: ${data.name}` : ''
        this.xk = data?.xk || 0
        this.nk = data?.nk || 0
    }

    static mapToList(data?: MapImportExportResponse[]){
        return data.map(item => new MapImportExportResponse(item))
    }
}