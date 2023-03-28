import {Controller, Get, HttpStatus, Res, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from '@nestjs/swagger';
import {Response} from "express";
import {BaseResponse} from "../utils/utils.response";
import {UserService} from "./user.service";
import {GetUserIdFromToken} from "../utils/utils.decorators";
import {CatchException} from "../exceptions/common.exception";
import {UserResponseSwagger} from "./responses/UserResponse";
import {DeviceGuard} from "../guards/device.guard";

@ApiTags('User - API')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {
    }

    @ApiOperation({ summary: 'Thông tin người dùng by token' })
    @ApiOkResponse({ type: UserResponseSwagger })
    @ApiBearerAuth()
    @UseGuards(DeviceGuard)
    @Get('info')
    async getInfo(@GetUserIdFromToken() user_id: number, @Res() res: Response) {
        try {
            const data = await this.userService.getInfo(user_id);
            return res.status(HttpStatus.OK).send(new BaseResponse({data}));
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
