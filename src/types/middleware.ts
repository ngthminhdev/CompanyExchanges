import { NextFunction, Request, Response } from 'express';

type MSign = {
  headers: {
    sign: string;
  };
};

export type MRequest = Request & MSign & Headers;
export type MResponse = Response;
export type MNextFunction = NextFunction;
