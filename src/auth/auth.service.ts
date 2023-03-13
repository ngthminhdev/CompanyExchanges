import {HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {Repository} from 'typeorm';
import {CatchException, ExceptionResponse,} from '../exceptions/common.exception';
import {UserResponse} from '../responses/UserResponse';
import {UserEntity} from '../user/entities/user.entity';
import {LoginDto} from './dto/login.dto';
import {RegisterDto} from './dto/register.dto';
import {AuthEntity} from './entities/auth.entity';
import {Request, Response} from "express";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepo: Repository<AuthEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
    ) {
    }

    userSign(user: UserEntity) {
        return {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            date_of_birth: user.date_of_birth,
            phone: user.phone,
            is_verified: user.is_verified,
            role: user.role,
            address: user.address,
        };
    }

    async register(data: RegisterDto): Promise<boolean> {
        try {
            const user = await this.userRepo.findOne({
                where: {phone: data.phone},
            });
            if (user) {
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Phone is already exists');
            }
            const saltOrRounds = 10;
            const hash: string = await bcrypt.hash(data.password, saltOrRounds);
            const userSave: UserEntity = await this.userRepo.save({
                name: data.first_name + ' ' + data.last_name,
                phone: data.phone,
                password: hash,
            });
            await this.authRepo.save({user: userSave});

            return true;
        } catch (e) {
            throw new CatchException(e);
        }
    }

    /**
     * Tạo thêm auth Record sau khi user đăng nhập
     */
    async login(loginDto: LoginDto, res: Response): Promise<UserResponse> {
        try {
            //logic
            const {phone, password} = loginDto;
            const userByPhone = await this.userRepo.findOne({where: {phone}});
            if (!userByPhone) {
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'phone is not registered');
            };

            const isPasswordMatch = await bcrypt.compare(password, userByPhone.password);

            if (!isPasswordMatch) {
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST,'password is not match');
            };

            delete userByPhone.password;

            const accessToken: string = this.generateAccessToken(userByPhone);
            const refreshToken: string = this.generateRefreshToken(userByPhone);

            await this.authRepo.update(
                {user: {user_id: userByPhone.user_id}},
                {access_token: accessToken, refresh_token: refreshToken},
            );

            res.cookie('refreshToken', refreshToken);

            return new UserResponse({
                ...userByPhone,
                access_token: accessToken,
            });
        } catch (e) {
            throw new CatchException(e);
        }
    }

    async refreshToken(req: Request) {
        try {
            const refreshToken: string = req.cookies['refreshToken'];

            if (!refreshToken) {
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token not found')
            }

            const exist = await this.authRepo.findOne({where: {refresh_token: refreshToken}});

            if (!exist) {
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token is not valid')
            }

            const payload: UserEntity | any = await this.jwtService.decode(refreshToken);

            return {payload};

        } catch (e) {
            throw new CatchException(e);
        }
    }

    generateAccessToken(user: UserEntity): string {
        return this.jwtService.sign(this.userSign(user), {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '1h'
        });
    }

    generateRefreshToken(user: UserEntity): string {
        return this.jwtService.sign(this.userSign(user), {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '1y'
        });
    }
}
