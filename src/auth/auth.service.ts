import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import {
    CatchException,
    ExceptionResponse
} from '../exceptions/common.exception';
import { UserResponse } from '../responses/UserResponse';
import { UserEntity } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ReigsterDto } from './dto/register.dto';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AuthEntity)
        private readonly authRepo: Repository<AuthEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
    ) {}

    async register(data: ReigsterDto) {
        try {
            const user = await this.userRepo.findOne({
                where: { email: data.email },
            });
            if (user)
                throw new ExceptionResponse(HttpStatus.BAD_REQUEST,'Email already exists');
            const saltOrRounds = 10;
            const password: string = data.password;
            const hash: string = await bcrypt.hash(password, saltOrRounds);
            const userSave: UserEntity = await this.userRepo.save({
                ...data,
                password: hash,
            });
            await this.authRepo.save({user: userSave,});

            return null;
        } catch (e) {
            throw new CatchException(e);
        }
    }

    /**
     * Tạo thêm auth Record sau khi user đăng nhập
     */
    async login(loginDto: LoginDto): Promise<UserResponse> {
        try {
            //logic
            const { email, password } = loginDto;
            const userByEmail = await this.userRepo.findOne({
                where: { email: email },
            });
            if (!userByEmail)
                throw new ExceptionResponse(
                    HttpStatus.BAD_REQUEST,
                    'Email not found'
                );
            const isPasswordMatch = await bcrypt.compare(
                password,
                userByEmail.password
            );
            if (!isPasswordMatch)
                throw new ExceptionResponse(
                    HttpStatus.BAD_REQUEST,
                    'Password is not match'
                );
            console.log(userByEmail);
            delete userByEmail.password;
            // userByEmail.date_of_birth = UtilCommonTemplate.toDate(userByEmail.date_of_birth);
            const accessToken = this.generateAccessToken(userByEmail);
            const refreshToken = this.generateRefreshToken(userByEmail);

            const authByUserId = await this.authRepo.findOne({
                where: { user: { user_id: userByEmail.user_id } },
            });
            authByUserId.access_token = accessToken;
            authByUserId.refresh_token = refreshToken;
            await this.authRepo.save(authByUserId);

            const loginResponse = new UserResponse({
                ...userByEmail,
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            return loginResponse;
        } catch (e) {
            throw new CatchException(e);
        }
    }

    generateAccessToken(user: UserEntity): string {
        return sign(
            {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                date_of_birth: user.date_of_birth,
                phone: user.phone,
                is_verified: user.is_verified,
                city: user.city,
                district: user.district,
                ward: user.ward,
                address: user.address,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
    }
    generateRefreshToken(user: UserEntity): string {
        return sign(
            {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                date_of_birth: user.date_of_birth,
                phone: user.phone,
                is_verified: user.is_verified,
                city: user.city,
                district: user.district,
                ward: user.ward,
                address: user.address,
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1y' }
        );
    }

    async verifyEmail(payload: any) {
        try {
            //logic

            return true;
        } catch (e) {
            throw new CatchException(e);
        }
    }
}
