import { ApiProperty } from "@nestjs/swagger"

export class ListOfEnterprisesWithLateBondResponse {
    @ApiProperty({
        type: String
    })
    name: string

    @ApiProperty({
        type: String
    })
    code: string

    @ApiProperty({
        type: Number
    })
    lai_tra_ky: number

    @ApiProperty({
        type: Number
    })
    gia_tri_goc: number

    constructor(data?: ListOfEnterprisesWithLateBondResponse){
        this.name = data?.name || ''
        this.code = data?.code || ''
        this.lai_tra_ky = data?.lai_tra_ky || 0
        this.gia_tri_goc = +data?.gia_tri_goc || 0
    }

    static mapToList(data?: ListOfEnterprisesWithLateBondResponse[]){
         return data.map(item => new ListOfEnterprisesWithLateBondResponse(item))
    }
}