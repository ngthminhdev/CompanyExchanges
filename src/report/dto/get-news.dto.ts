import { ApiProperty } from "@nestjs/swagger";

export class getNewsDto {
    @ApiProperty({
        type: Number,
        description: `0 - Tin quốc tế, 1 - Tin trong nước, 2 - Tin doanh nghiệp, 3 - Tin quốc tế báo cáo tuần, 4 - Tin trong nước báo cáo tuần`
    })
    id: number
}