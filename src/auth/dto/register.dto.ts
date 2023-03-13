import {ApiProperty} from '@nestjs/swagger';
import {IsPhoneNumber, IsString, Matches,} from 'class-validator';

export class RegisterDto {
    @IsPhoneNumber('VN')
    @ApiProperty({
        type: String,
        example: '0343892050',
        description: 'Số điện thoại phải đúng 10 số! theo số điện thoại Việt Nam!',
    })
    phone: string;

    @IsString({message: 'password not found'})
    @ApiProperty({
        type: String,
        example: 'nguyenvana0Hh',
        description:
            'Mật khẩu phải ít nhất 8 ký tự, trong đó phải có ít nhất 1 chữ cái in hoa, in thường và 1 ký tự đặc biệt!!!',
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/, {
        message: 'password too weak',
    })
    password: string;

    @IsString({message: 'first_name not found'})
    @ApiProperty({
        type: String,
        example: 'Nguyen',
    })
    first_name: string;

    @IsString({message: 'last_name not found'})
    @ApiProperty({
        type: String,
        example: 'Minh',
    })
    last_name: string;
}
