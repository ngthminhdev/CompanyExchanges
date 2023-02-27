import {Body, Controller, HttpStatus, Post, Res} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {BaseResponse} from '../utils/utils.response';
import {Response} from 'express';
import {LoginDto} from './dto/login.dto';
import {RegisterDto} from './dto/register.dto';
import {UserResponseSwagger} from '../responses/UserResponse';

@ApiTags('Auth - API')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    @ApiOperation({
        summary: 'Register',
    })
    @ApiBody({type: RegisterDto})
    @ApiResponse({status: HttpStatus.CREATED, type: BaseResponse})
    async register(@Body() body: RegisterDto, @Res() res: Response) {
        const data = await this.authService.register(body);
        return res
            .status(HttpStatus.CREATED)
            .send(new BaseResponse({data: data}));
    }

    @ApiOperation({
        summary: 'Login',
    })
    @ApiBody({type: LoginDto})
    @ApiResponse({status: HttpStatus.OK, type: UserResponseSwagger})
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const data = await this.authService.login(loginDto, res);
        return res.status(HttpStatus.OK).send(new BaseResponse({data: data}));
    }
}
