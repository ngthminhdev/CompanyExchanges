import { ApiProperty, PartialType } from "@nestjs/swagger";
import { BaseResponse } from "../../utils/utils.response";


export class RegisterResponse {
    @ApiProperty({
        type: Number,
        example: 99
    })
    user_id: number;

    constructor(data: any) {
        this.user_id = data?.user_id || 0
    }
}

export class RegisterSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: RegisterResponse,
    })
    data: RegisterResponse;
}