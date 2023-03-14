import {CACHE_MANAGER, HttpStatus, Inject, Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "./entities/user.entity";
import {DataSource, Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {ExceptionResponse} from "../exceptions/common.exception";
import {Cache} from "cache-manager";
import {UserResponse} from "./responses/UserResponse";
import {AuthEntity} from "../auth/entities/auth.entity";
import {isNotEmpty} from "class-validator";
import {RedisKeys} from "../enums/redis-keys.enum";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(AuthEntity)
        private readonly authRepo: Repository<AuthEntity>,
        @InjectDataSource()
        private readonly db: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly redis: Cache,
        private readonly jwtService: JwtService,
    ) {
    }

    async getInfo(user_id: number): Promise<UserResponse> {
        const redisData: UserResponse = await this.redis.get(`${RedisKeys.User}:${user_id}`);
        if (redisData) return redisData;
        const data: UserResponse[] = await this.db.query(`
                SELECT u.user_id, 
                u.email,
                u.name,
                u.avatar,
                u.date_of_birth,
                u.phone,
                u.is_verified,
                u.role,
                u.address,
                a.access_token
                FROM [AUTH].[dbo].[user] u
                JOIN [AUTH].[dbo].[auth] a ON
                a.user_id = u.user_id
                WHERE u.user_id = @0
            `, [user_id]
        );

        if (!isNotEmpty(data)) throw new ExceptionResponse(HttpStatus.BAD_REQUEST, 'user not found');

        const mappedData = new UserResponse(data[0]);
        await this.redis.set(`${RedisKeys.User}:${user_id}`, mappedData)
        return mappedData;
    }
}
