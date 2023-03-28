import {CACHE_MANAGER, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {DataSource, Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {ExceptionResponse} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {UserResponse} from "./responses/UserResponse";
import {DeviceEntity} from "../auth/entities/device.entity";
import {RedisKeys} from "../enums/redis-keys.enum";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(DeviceEntity)
        private readonly authRepo: Repository<DeviceEntity>,
        @InjectDataSource()
        private readonly db: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        private jwtService: JwtService,
    ) {
    }

    async getInfo(userId: number): Promise<UserResponse> {
        const redisData: UserResponse = await this.redis.get(`${RedisKeys.User}:${userId}`);
        if (redisData) return redisData;
        const user: UserEntity = await this.userRepo.findOne({where: {user_id: userId}});
        if (!user) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'user not found');
        const mappedData = new UserResponse(user);
        await this.redis.set(`${RedisKeys.User}:${userId}`, mappedData)
        return mappedData;
    }
}
