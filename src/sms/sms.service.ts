import { Injectable } from '@nestjs/common';
import { CatchException } from "../exceptions/common.exception";
import { HttpConfigService } from '../http/http.service';
@Injectable()
export class SmsService {
    client: any;
    constructor(
        private readonly httpService: HttpConfigService
    ) {}

    //Call API INCOM
    async sendSMS(to: string, body: string) {
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
