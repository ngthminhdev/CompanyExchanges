import { PartialType } from '@nestjs/swagger';
import { BaseResponse } from '../utils/utils.response';

export class UserSignUpResponse extends PartialType(BaseResponse) {
  constructor({ status, message, data }: Partial<UserSignUpResponse>) {
    super({ status, message, data });
  }
}
