import { ApiProperty } from "@nestjs/swagger"
import { ValueSaveFilter } from "../dto/save-filter.dto"

export class FilterUserResponse {
    @ApiProperty({
        type: String
    })
    filter_id: number

    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: ValueSaveFilter,
        isArray: true
    })
    value: string

    constructor(data?: any){
        this.filter_id = data?.filter_id || 0
        this.name = data?.name || ''
        this.value = data?.value ? JSON.parse(data.value) : []
    }


    static mapToList(data?: FilterUserResponse[]){
         return data.map(item => new FilterUserResponse(item))
    }
}