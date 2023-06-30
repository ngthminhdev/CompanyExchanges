import {CACHE_MANAGER, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository} from "typeorm";
import {ExceptionResponse} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {UserResponse} from "./responses/UserResponse";
import {RedisKeys} from "../enums/redis-keys.enum";
import { DB_SERVER } from '../constants';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
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
