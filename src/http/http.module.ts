import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { HttpConfigService } from './http.service';

@Global()
@Module({
  imports: [HttpModule.register({
    timeout: 5000
  })],
  providers: [HttpConfigService],
  exports: [HttpConfigModule, HttpConfigService]
})
export class HttpConfigModule { }
