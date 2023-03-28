import {HttpStatus, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {Repository} from 'typeorm';
import {ExceptionResponse,} from '../exceptions/common.exception';
import {UserResponse} from '../user/responses/UserResponse';
import {UserEntity} from '../user/entities/user.entity';
import {LoginDto} from './dto/login.dto';
import {RegisterDto} from './dto/register.dto';
import {DeviceEntity} from './entities/device.entity';
import {Response} from "express";
import {TimeToLive} from "../enums/common.enum";
import {MRequest} from "../types/middleware";
import {randomUUID} from "crypto";
import {DeviceLoginInterface} from "../device-login.interface";
import {UtilCommonTemplate} from "../utils/utils.common";
import {DeviceSessionResponse} from "./responses/DeviceSession.response";
import {RefreshTokenResponse} from "./responses/RefreshToken.response";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(DeviceEntity)
        private readonly deviceRepo: Repository<DeviceEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
    ) {
    }

    generateAccessToken(userId: number, role: number, deviceId: string, secretKey: string): string {
        return this.jwtService.sign({
            userId: userId,
            role: role,
            deviceId: deviceId
        }, {
            secret: secretKey,
            expiresIn: TimeToLive.OneDayMiliSeconds
        });
    }

    generateRefreshToken(userId: number, deviceId: string): string {
        return this.jwtService.sign({
            userId: userId,
            deviceId: deviceId
        }, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: TimeToLive.OneWeekMiliSeconds
        });
    }

    async register(data: RegisterDto): Promise<boolean> {
        const user = await this.userRepo.findOne({
            where: {phone: data.phone},
        });
        if (user) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Số điện thoại đã được đăng ký');
        }
        const saltOrRounds = 10;
        const hash: string = await bcrypt.hash(data.password, saltOrRounds);
        await this.userRepo.save({
            name: data.first_name + ' ' + data.last_name,
            phone: data.phone,
            password: hash,
        });

        return true;
    }

    async login(req: MRequest, loginDto: LoginDto, headers: Headers, res: Response): Promise<UserResponse> {
        const {phone, password} = loginDto;
        // Tìm người dùng bằng số điện thoại
        const userByPhone = await this.userRepo.findOne({where: {phone}});
        if (!userByPhone) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Số điện thoại chưa được đăng ký');
        }

        // Kiểm tra mật khẩu của người dùng
        const isPasswordMatch = await bcrypt.compare(password, userByPhone.password);
        if (!isPasswordMatch) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'Số điện thoại / mật khẩu không chính xác');
        }

        // Lấy thông tin MAC ID, Device ID, địa chỉ IP và User Agent
        const macId: string = req.mac;
        const deviceId: string = req.deviceId;
        const ipAddress: string = req.socket.remoteAddress;
        const userAgent: string = headers['user-agent'];

        // Xử lý phiên đăng nhập của thiết bị
        const {
            accessToken,
            refreshToken,
            expiredAt
        } = await this.handleDeviceSession(userByPhone, macId, deviceId, ipAddress, userAgent);

        // Lưu cookie refreshToken
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/',
        });

        // Trả về thông tin người dùng kèm access token và thời gian hết hạn
        return new UserResponse({
            ...userByPhone,
            access_token: accessToken,
            expired_at: expiredAt
        });

    }

    async handleDeviceSession(user: UserEntity, macId: string, deviceId: string, ipAddress: string, userAgent: string): Promise<DeviceLoginInterface> {
        // Tìm kiếm thiết bị hiện tại theo device_id
        const currentDevice = await this.deviceRepo.findOne({where: {device_id: deviceId}});

        // Tạo secretKey ngẫu nhiên bằng uuid
        const secretKey: string = UtilCommonTemplate.uuid();

        // Tạo accessToken, refreshToken và expiredAt mới
        const accessToken: string = this.generateAccessToken(user.user_id, user.role, deviceId, secretKey);
        const refreshToken: string = this.generateRefreshToken(user.user_id, deviceId);
        const expiredAt: Date = new Date(Date.now() + TimeToLive.OneDayMiliSeconds);

        // Lưu thông tin của thiết bị mới vào database
        const newDevice = await this.deviceRepo.save({
            id: currentDevice?.id || randomUUID(),
            user: user,
            mac_id: macId,
            device_id: deviceId,
            user_agent: userAgent,
            expired_at: expiredAt,
            ip_address: ipAddress,
            secret_key: secretKey,
            refresh_token: refreshToken,
        });

        // Thêm thiết bị mới vào danh sách các thiết bị của user
        user.devices?.push(newDevice);
        await this.userRepo.save(user);

        // Trả về accessToken, refreshToken và expiredAt mới
        return {accessToken, refreshToken, expiredAt};
    }

    async logout(userId: number, deviceId: number, res: Response): Promise<boolean> {
        const currentSession = await this.deviceRepo
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.user', 'user')
            .select(['device', 'user.user_id'])
            .where('device.device_id = :deviceId', {deviceId})
            .andWhere('user.user_id = :userId', {userId})
            .getOne();

        if (!currentSession || currentSession.user.user_id !== userId) {
            throw new ExceptionResponse(HttpStatus.FORBIDDEN, 'you are not allow to do that')
        }

        res.cookie('refreshToken', '', {
            maxAge: -1,
            path: '/',
            httpOnly: true,
        })

        await this.deviceRepo.delete(deviceId);
        return true;
    }

    async getSecretKey(deviceId: string): Promise<string> {
        return (await this.deviceRepo.findOne({
                where: {device_id: deviceId},
                select: ['secret_key']
            })
        )?.['secret_key'];
    }

    async refreshToken(req: MRequest, res: Response): Promise<RefreshTokenResponse> {
        const refreshToken: string = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token not found')
        }
        const deviceId: string = req.deviceId;

        const currentDevice: DeviceEntity = await this.deviceRepo
            .createQueryBuilder('device')
            .select('device', 'user.user_id')
            .leftJoinAndSelect('device.user', 'user')
            .where('device.refresh_token = :refreshToken', {refreshToken})
            .andWhere('device.device_id = :deviceId', {deviceId})
            .getOne();

        if (!currentDevice) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token is not valid')
        }

        const refreshExpired: number = (this.jwtService.decode(refreshToken))?.['exp'] * 1000;
        if (refreshExpired < new Date().valueOf()) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token is not valid')
        }

        if (!this.jwtService.verify(refreshToken, {secret: process.env.REFRESH_TOKEN_SECRET})) {
            throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'refresh token is not valid')
        }

        const secretKey = UtilCommonTemplate.uuid();
        const newAccessToken: string = this.generateAccessToken(currentDevice.user.user_id, currentDevice.user.role, deviceId, secretKey);
        const newRefreshToken: string = this.generateRefreshToken(currentDevice.user.user_id, deviceId);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            path: '/',
        });
        const expiredAt: Date = new Date(Date.now() + TimeToLive.OneDayMiliSeconds);
        await this.deviceRepo.update({device_id: deviceId},
            {
                secret_key: secretKey,
                refresh_token: newRefreshToken,
                expired_at: expiredAt,
            })
        return new RefreshTokenResponse({
            access_token: newAccessToken,
            expire_at: expiredAt,
        });
    }

    async getHistorySession(userId: number) {
        const data: DeviceEntity[] = await this.deviceRepo
            .createQueryBuilder('device')
            .innerJoinAndSelect('device.user', 'user')
            .where('user.user_id = :userId', {userId})
            .getMany();

        return new DeviceSessionResponse().mapToList(data);
    }
}
