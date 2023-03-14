import {ApiProperty, PartialType} from "@nestjs/swagger";
import {BaseResponse} from "../../utils/utils.response";


export class RefreshTokenResponse {
    @ApiProperty({
        type: 'String',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJlbWFpbCI6IiIsIm5hbWUiOiJOZ3V5ZW4gTWluaCIsImF2YXRhciI6IiIsImRhdGVfb2ZfYmlydGgiOiIyMDAwLTAxLTAxIiwicGhvbmUiOiIwMzQzODkyMDUwIiwiaXNfdmVyaWZpZWQiOjAsInJvbGUiOjAsImFkZHJlc3MiOiIiLCJpYXQiOjE2Nzg2Nzk2NjEsImV4cCI6MTcxMDIzNzI2MX0.zJYw6CmGA_siBdc4uRFHXFCIszcl9LKI6N8zl--wP_s'
    })
    access_token: string;

    constructor(data: any) {
        this.access_token = data?.access_token || ""
    }
}

export class RefreshTokenSwagger extends PartialType(BaseResponse) {
    @ApiProperty({
        type: RefreshTokenResponse,
    })
    data: RefreshTokenResponse;
}