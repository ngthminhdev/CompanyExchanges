import {CanActivate, ExecutionContext, HttpStatus, Injectable} from "@nestjs/common";
import {MRequest} from "../types/middleware";
import {ExceptionResponse} from "../exceptions/common.exception";
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "../auth/auth.service";
import { DeviceEntity } from "../auth/entities/device.entity";

@Injectable()
export class DeviceGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
    ) {}

    /**
     * Hàm này được sử dụng để xác thực token của request và kiểm tra thiết bị được sử dụng trong request
     * @param req: Request của client
     * @returns boolean: Kết quả của việc xác thực
     */
    private async validateRequest(req: MRequest): Promise<boolean> {
        // Lấy token từ header của request
        const bearer: string = req.headers.authorization;
        const token: string = bearer?.split(' ')[1];

        // Kiểm tra xem token có tồn tại hay không
        if (!bearer || !token) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token is not valid');
        }

        // Lấy deviceId từ token và từ request
        const checkDeviceId: string = this.jwtService.decode(token)?.['deviceId'];
        const deviceId: string = req?.deviceId;

        // Kiểm tra xem deviceId có hợp lệ hay không
        if (checkDeviceId !== deviceId) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'device is not valid');
        }
        // Lấy secret key từ authService và kiểm tra tính hợp lệ của token
        const {secret_key, expired_at}: Awaited<Pick<DeviceEntity, "secret_key" | "expired_at">>
            = await this.authService.getSecretKey(deviceId);

        // Kiểm tra thiết bị còn hợp lệ hay không
        if (expired_at < new Date()) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'device is expired');
        }

        try {
            // Kiểm tra tính hợp lệ của token
            return !!this.jwtService.verify(token, { secret: secret_key });
        } catch (e) {
            return false;
        }
    }

    /**
     * Hàm này được sử dụng để kiểm tra xem request có được phép truy cập hay không
     * @param context: ExecutionContext của NestJS
     * @returns boolean: Kết quả của việc xác thực
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: MRequest = context.switchToHttp().getRequest();
        const checkDevice = await this.validateRequest(req);
        if (!checkDevice) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'device is not valid');
        }
        return true;
    }
}