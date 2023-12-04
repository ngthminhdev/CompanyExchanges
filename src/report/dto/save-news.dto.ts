import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class INews {
    @ApiProperty({
        type: String
    })
    title: string

    @ApiProperty({
        type: String
    })
    href: string
}

export class SaveNewsDto {
    @IsEnum([0, 1, 2])
    @ApiProperty({
        type: Number,
        description: `0 - Tin quốc tế, 1 - Tin trong nước, 2 - Tin doanh nghiệp`
    })
    id: number

    @ApiProperty({
        type: INews,
        isArray: true
    })
    value: INews[]
}