import {Request} from 'express';

export type MRequest = Request & {
  mac: string;
  realIP: any,
  deviceId: string;
  headers: {
    sign: string;
  };
};
