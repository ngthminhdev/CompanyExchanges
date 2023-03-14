import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {CatchException} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {UserResponse} from "./responses/UserResponse";
import {RedisKeys} from "../enums/redis-keys.enum";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        private readonly jwtService: JwtService,
    ) {
    }

    async getInfo(user_id: number): Promise<UserResponse> {
        try {
            const redisData: UserResponse = await this.redis.get(`${RedisKeys.User}:${user_id}`);
            if (redisData) return redisData;

            const mappedData = new UserResponse(await this.userRepo.findOne(
                {where: {user_id}
            }));
            await this.redis.set(`${RedisKeys.User}:${user_id}`, mappedData)
            return mappedData;
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
