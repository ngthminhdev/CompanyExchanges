import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsUppercase,
    MaxLength,
    MinLength,
} from 'class-validator';

export class LoginDto {
    @ApiProperty({
        type: String,
        example: 'foo@gmail.com',
        description: 'Email đã đăng ký',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        type: String,
        example: 'abc123',
        description: 'Password tối thiểu 6 ký tự, tối đa 50 ký tự',
    })
    @MinLength(6)
    @MaxLength(50)
    password: string;
}
