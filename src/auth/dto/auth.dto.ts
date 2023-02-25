import {ApiProperty} from '@nestjs/swagger';
import {Transform} from 'class-transformer';
import {IsInt, IsNotEmpty, IsString} from 'class-validator';

export class AuthDto {
  @ApiProperty({
    type: String,
    example:
      'eyJhoiohoiahdooinJHFujfajkkj4378uhkfhakfjkdfjkandaknsdmaidahuidh88934242jhjkhfsdjdkfjsJHAJDAHD',
    description:
      'Một dãy mã được mã hóa dùng để xác thực request, được tạo và server trả về lưu trong storage, có thời hạn!',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Nhận 0 và 1, 0: không hợp lệ | 1: hợp lệ.',
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  status: number;

  @ApiProperty({
    type: Number,
    example: 15,
    description: 'Id của user',
  })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  user_id: number;

  @IsString()
  @ApiProperty({
    type: String,
    example:
      'eyJhoiohoiahdooinJHFujfajkkj4378uhkfhakfjkdfjkandaknsdmaidahuidh88934242jhjkhfsdjdkfjsJHAjhdjsa',
    description: 'Một dãy ký tự được mã hóa, dùng để verify token',
  })
  verified_token: string;
}
