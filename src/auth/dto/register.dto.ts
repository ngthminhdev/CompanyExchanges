import {ApiProperty} from '@nestjs/swagger';
import {IsPhoneNumber, IsString, Matches, Validate, ValidateIf,} from 'class-validator';
import {PasswordMatchValidator} from "../../validators/password-match.validator";

export class RegisterDto {
    @IsPhoneNumber('VN')
    @ApiProperty({
        type: String,
        example: '0343892050',
        description: 'Số điện thoại phải đúng 10 số! theo số điện thoại Việt Nam!',
    })
    phone: string;

    @IsString({message: 'password not found'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'password too weak',
    })
    @ApiProperty({
        type: String,
        example: '123Beta456@',
        description:
            'Mật khẩu phải ít nhất 8 ký tự, trong đó phải có ít nhất 1 chữ cái in hoa, in thường và 1 ký tự đặc biệt',
    })
    password: string;

    @ValidateIf((o) =>o.password != undefined)
    @Validate(PasswordMatchValidator)
    @ApiProperty({
        type: String,
        example: '123Beta456@',
    })
    confirm_password: string;

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
