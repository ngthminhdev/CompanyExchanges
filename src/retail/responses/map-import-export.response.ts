import { ApiProperty } from "@nestjs/swagger"

export class MapImportExportResponse {
    @ApiProperty({
        type: String,
    })
    name: string

    @ApiProperty({
        type: Number,
    })
    value: number

    constructor(data?: MapImportExportResponse){
        this.name = data?.name || ''
        this.value = data?.value || 0
    }

    static mapToList(data?: MapImportExportResponse[]){
        return data.map(item => new MapImportExportResponse(item))
    }
}