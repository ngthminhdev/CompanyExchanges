import { Request } from 'express';

export type MRequest = Request & {
  realIP: any;
  deviceId: string;
  headers: {
    mac: string;
    sign: string;
  };
};
