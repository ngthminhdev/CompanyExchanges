import {ApiProperty} from '@nestjs/swagger';
import {IsPhoneNumber, IsString} from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('VN')
  @ApiProperty({
    type: String,
    example: '0987654321',
  })
  phone: string;

  @IsString({message: 'password not found'})
  @ApiProperty({
    type: String,
    example: '123beta456',
  })
  password: string;
}
