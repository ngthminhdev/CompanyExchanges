import {Request} from 'express';

export type MRequest = Request & {
  mac: string;
  deviceId: string;
  headers: {
    sign: string;
  };
};
