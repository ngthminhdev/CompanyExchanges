import {ApiPropertyOptional} from "@nestjs/swagger";
import {IsNumberString, IsOptional} from "class-validator";


export class RsiQueryDto {
    @IsOptional()
    @IsNumberString({}, {message: 'session not found'})
    @ApiPropertyOptional({
        type: Number,
        example: 20
    })
    session: number;
}