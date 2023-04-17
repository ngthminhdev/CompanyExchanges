import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class VerifyOTPDto {
    @IsString( {message: 'verifyOTP not found'})
    @ApiProperty({
        type: String
    })
    verifyOTP: string;
}