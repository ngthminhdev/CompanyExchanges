import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User - API')
@Controller('user')
export class UserController {}
