import {createParamDecorator, ExecutionContext, HttpStatus} from '@nestjs/common';
import {registerDecorator, ValidationArguments, ValidationOptions} from 'class-validator';

import {JwtService} from '@nestjs/jwt';
import {ExceptionResponse} from "../exceptions/common.exception";
import {log} from "util";

export function IsGetByUserId(validationOptions?: ValidationOptions) {
    return (object: unknown, propertyName: string) => {
        registerDecorator({
            name: 'isGet',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate: (value: any): boolean => {
                    console.log(value);
                    if (value === null || value === undefined || value === '') {
                        return true;
                    } else if (typeof value === 'number') {
                        return Number.isInteger(value);
                    } else if (typeof value === 'string') {
                        return Number.isInteger(Number(value));
                    }
                },
                defaultMessage: (validationArguments?: ValidationArguments): string => {
                    console.log(validationArguments);
                    throw new ExceptionResponse(HttpStatus.NOT_FOUND, `Cannot GET /api/v1/media/${validationArguments.value}`, {
                        error: 'Not Found',
                    });
                },
            },
        });
    };
}

export const GetUserIdFromToken = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const jwt = new JwtService();
    const bearer = request.headers.authorization;
    if (!bearer) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token not found');
    }

    const token = bearer.split(' ')[1];
    // const isTrust = jwt.verify(token, {
    //     secret: process.env.ACCESS_TOKEN_SECRET
    // }).catchcon((e) => console.log(e))
    // if (!isTrust) {
    //     throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token is not valid')
    // }

    const payload: any = jwt.decode(token);

    if (!payload || !payload.user_id) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token not found');
    }

    return payload.user_id;
});

export const GetToken = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bearer = request?.headers?.authorization;

    if (!bearer) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'token not found');
    }
    return bearer.split(' ')[1];
});
