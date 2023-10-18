import { Module } from '@nestjs/common';
import { HttpConfigModule } from '../http/http.module';
import { HttpConfigService } from '../http/http.service';
import { SmsService } from "./sms.service";

@Module({
  imports: [HttpConfigModule],
  providers: [SmsService],
})
export class SmsModule {}
