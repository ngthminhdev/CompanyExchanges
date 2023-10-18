import { Injectable } from '@nestjs/common';
import * as twilio from "twilio";
import { CatchException } from "../exceptions/common.exception";
import { HttpConfigService } from '../http/http.service';
@Injectable()
export class SmsService {
    client: any;
    constructor(
        private readonly httpService: HttpConfigService
    ) {
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

    //Call API INCOM
    async sendSMSV2(to: string, body: string) {
        try {
            return await this.httpService.post(process.env.INCOM_SMS_URL,
                {
                    Username: process.env.INCOM_SMS_ACCOUNT,
                    Password: process.env.INCOM_SMS_PASSWORD,
                    PhoneNumber: to,
                    PrefixId: process.env.INCOM_SMS_BRAND_NAME,
                    CommandCode: process.env.INCOM_SMS_BRAND_NAME,
                    RequestId: "0",
                    MsgContent: body,
                    MsgContentTypeId: 0,
                    FeeTypeId: 0
                }, { 'Content-Type': 'application/json' })
        } catch (e) {
            throw new CatchException(e)
        }
    }
}
