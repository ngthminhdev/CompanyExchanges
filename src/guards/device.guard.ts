import {CanActivate, ExecutionContext, HttpStatus, Injectable} from "@nestjs/common";
import {MRequest} from "../types/middleware";
import {ExceptionResponse} from "../exceptions/common.exception";
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class DeviceGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
    ) {
    }

    private async validateRequest(req: MRequest): Promise<boolean> {
        const bearer: string = req.headers.authorization;
        const token: string = bearer?.split(' ')[1];

        //logic decode, validate token ...
        if (!bearer || !token) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token not found!');
        }
        const checkDeviceId = this.jwtService.decode(token)['deviceId'];
        const deviceId = req.deviceId;

        if (checkDeviceId !== deviceId) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'device is not valid');
        }

        try {
            const secretKey: string = (await this.authService.getSecretKey(deviceId));
            return !!this.jwtService.verify(token, {secret: secretKey});
        } catch (e) {
            return false
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: MRequest = context.switchToHttp().getRequest();
        const checkDevice = await this.validateRequest(req);
        if (!checkDevice) {
            throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'device is not valid');
        }
        return true;
    }
}