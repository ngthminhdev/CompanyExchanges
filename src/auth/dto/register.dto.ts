import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    type: String,
    example: 'nguyenvana@gmail.com',
    description:
      'Email phải có đuôi @...com | ví dụ: user@gmail.com, user@yahoo.com!',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    type: String,
    example: 'nguyenvana0Hh',
    description:
      'Mật khẩu phải ít nhất 8 ký tự, trong đó phải có ít nhất 1 chữ cái in hoa, in thường và 1 ký tự đặc biệt!!!',
  })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/, {
    message: 'password too weak',
  })
  password: string;
  @ApiProperty({
    type: String,
    example: 'Nguyen Van A',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    type: Number,
    example: 'http://avatar.com',
    description: 'Nhận string là một url của image!!',
  })
  @IsNotEmpty()
  avatar: string;
  @ApiProperty({
    type: Date,
    example: '2020-01-15',
    description:
      'Format theo cấu trúc YYYY-MM-DD!, ví dụ ngày 15 tháng 1 năm 2020 sẽ là 2020-01-15',
  })
  @IsDate()
  @Type(() => Date)
  date_of_birth: Date;
  @ApiProperty({
    type: String,
    example: '0901111547',
    description: 'Số điện thoại phải đúng 10 số! theo số điện thoại Việt Nam!',
  })
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;
  @ApiProperty({
    type: String,
    example: '45/2/1',
    description: 'Số nhà!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  address: string;
  @ApiProperty({
    type: Number,
    example: '5',
    description:
      'Chỗ này sẽ nhận giá trị là number tương ứng với ô optional của thành phố!!',
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  city_id: number;
  @ApiProperty({
    type: Number,
    example: '3',
    description:
      'Chỗ này sẽ nhận giá trị là number tương ứng với ô optional của quận, huyện!!',
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  district_id: number;
  @ApiProperty({
    type: Number,
    example: '2',
    description:
      'Chỗ này sẽ nhận giá trị là number tương ứng với ô optional của phường, ấp!!',
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  ward_id: number;
}
