import {ApiProperty} from '@nestjs/swagger';
import {IsPhoneNumber, IsString} from 'class-validator';

export class LoginDto {
  @IsPhoneNumber('VN')
  @ApiProperty({
    type: String,
    example: '0343892050',
  })
  phone: string;

  @IsString({message: 'password not found'})
  @ApiProperty({
    type: String,
    example: 'abc123',
  })
  password: string;
}
