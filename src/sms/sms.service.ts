import { Injectable } from '@nestjs/common';
import * as twilio from "twilio";
import {CatchException} from "../exceptions/common.exception";
@Injectable()
export class SmsService {
    client: any;
    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    }

    async sendSMS(to: string, body: string): Promise<void> {
        try {
            const message = await this.client.messages.create({
                to,
                from: process.env.TWILIO_PHONE_NUMBER,
                body,
            });

            console.log(`SMS sent to ${to}: ${message.sid}`);
        } catch (err) {
            throw new CatchException(err);
        }
    }
}
