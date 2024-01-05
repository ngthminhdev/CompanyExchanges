import { ApiProperty } from "@nestjs/swagger"
import { MemoryStoredFile } from "nestjs-form-data"

export class SetFlexiblePageDto {
    @ApiProperty({
        type: Number,
        description: 'Trang linh động thứ bao nhiêu'
    })
    page: number

    @ApiProperty({
        type: MemoryStoredFile,
        isArray: true,
        description: 'mảng file'
    })
    image: MemoryStoredFile[]

    @ApiProperty({
        type: String,
        isArray: true
    })
    text: string[]
}