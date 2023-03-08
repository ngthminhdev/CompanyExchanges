import {WsException} from '@nestjs/websockets';
import {Logger} from "@nestjs/common";

export class CatchSocketException extends WsException {
    constructor(error: any) {
        super(error);
        CatchSocketException.getStackTrace(error);
    }

    static getStackTrace(message?: string) {
        const obj = {} as any;
        Error.captureStackTrace(obj, this.getStackTrace);
        const logger = new Logger('SocketError', {
            timestamp: true,
        });

        const originFile = obj.stack.split('\n')[2].split('/');
        const fileName = originFile[originFile.length - 1].split(':')[0];
        const lineNumber = +originFile[originFile.length - 1].split(':')[1];
        const path = obj.stack
            .split('at ')[2]
            .trim()
            .split(' ')[1]
            .replace('(', '')
            .replace(')', '');

        logger.error(
            `Message: ${message} - File: ${fileName} - Line: ${lineNumber} - Path: ${path}`,
        );
    }
}
