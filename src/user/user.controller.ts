import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import {ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Response} from "express";
import {BaseResponse} from "../utils/utils.response";
import {UserService} from "./user.service";
import {GetUserIdFromToken} from "../utils/utils.decorators";
import {CatchException} from "../exceptions/common.exception";
import {UserResponseSwagger} from "./responses/UserResponse";

@ApiTags('User - API')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {
    }

    @Get('info')
    @ApiOperation({
        summary: 'Thông tin người dùng by token',
    })
    @ApiOkResponse({ type: UserResponseSwagger })
    async getInfo(@GetUserIdFromToken() user_id: number, @Res() res: Response) {
        try {
            const data = await this.userService.getInfo(user_id);
            return res.status(HttpStatus.OK).send(new BaseResponse({data}));
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
