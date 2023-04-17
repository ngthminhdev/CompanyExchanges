import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class DeviceIdParamDto {
    @IsString({message: 'deviceId not found'})
    @ApiProperty({
        type: Number
    })
    deviceId: string
}