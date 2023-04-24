import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { MRequest } from "../types/middleware";
import { UtilCommonTemplate } from "../utils/utils.common";

@Injectable()
export class RealIpMiddleware implements NestMiddleware {
    async use(req: MRequest, res: Response, next: NextFunction) {
        const userAgent: string = req.headers["user-agent"];
        const realIp: any = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        req.deviceId = UtilCommonTemplate.generateDeviceId(userAgent, realIp);
        req.realIP = realIp;
        next();
    }
}