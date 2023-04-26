import {ApiProperty} from "@nestjs/swagger";
import {IsString} from "class-validator";


export class IndexQueryDto {
    @IsString({message: "index not found"})
    @ApiProperty({
        type: String,
        description:
            `<h5>
                <font color="#228b22">Index hợp lệ: </font>
                <font color="#ff4500">VNINDEX, VNXALL, VN30, HNXINDEX, HNX30, UPINDEX</font>
            </h5>`
    })
    index: string;

}