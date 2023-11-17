import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class ValueSaveFilter {
    @ApiProperty({
        type: String
    })
    key: string

    @ApiProperty({
        type: Number
    })
    min: number

    @ApiProperty({
        type: Number
    })
    max: number
}

export class SaveFilterDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Tên bộ lọc'
    })
    name: string

    @IsNotEmpty()
    @ApiProperty({
        type: ValueSaveFilter,
        isArray: true,
        description: 'Mảng các key, min, max'

    })
    value: ValueSaveFilter[]
}

