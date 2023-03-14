import { ApiResponseProperty, PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../../utils/utils.response';
import {UtilCommonTemplate} from "../../utils/utils.common";

export class UserResponse {
  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  user_id: number;

  @ApiResponseProperty({
    type: String,
    example: 'foo@gmail.com',
  })
  email: string;

  @ApiResponseProperty({
    type: String,
    example: 'Marc Spector',
  })
  name: string;

  @ApiResponseProperty({
    type: String,
    example:
      'https://vuipet.com/wp-content/uploads/2021/05/cho-corgi-gia-1.jpg',
  })
  avatar: string;

  @ApiResponseProperty({
    type: Date,
    example: '01/01/2000',
  })
  date_of_birth: string | Date;

  @ApiResponseProperty({
    type: String,
    example: '84325166655',
  })
  phone: string;

  @ApiResponseProperty({
    type: Number,
    example: 0,
  })
  is_verified: number;

  @ApiResponseProperty({
    type: Number,
    example: 0,
  })
  is_receive_email: number;

  // @ApiResponseProperty({
  //   type: Number,
  //   example: '336',
  // })
  // city: number;
  //
  // @ApiResponseProperty({
  //   type: Number,
  //   example: '321',
  // })
  // district: number;
  //
  // @ApiResponseProperty({
  //   type: Number,
  //   example: '655',
  // })
  // ward: number;

  @ApiResponseProperty({
    type: Number,
    example: 0,
  })
  role: number;

  @ApiResponseProperty({
    type: String,
    example: 'Texas, American',
  })
  address: string;

  @ApiResponseProperty({
    type: String,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access_token: string;

  constructor(data?: UserResponse | any) {
    this.user_id = data?.user_id ?? 0;
    this.email = data?.email ?? '';
    this.name = data?.name ?? '';
    this.avatar = data?.avatar ?? '';
    this.date_of_birth = UtilCommonTemplate.toDateTime(data?.date_of_birth) ?? '';
    this.phone = data?.phone ?? 0;
    this.is_verified = data?.is_verified ?? 0;
    this.role = data?.role ?? 0;
    this.address = data?.address ?? '';
    this.access_token = data?.access_token ?? '';
  }

  public mapToList(data?: UserResponse[] | any[]): UserResponse[] {
    return data.map((item) => new UserResponse(item));
  }
}

/**
 * extends lại BaseRespone
 */

export class UserResponseSwagger extends PartialType(BaseResponse) {
  @ApiResponseProperty({
    type: UserResponse,
  })
  data: UserResponse;
}
