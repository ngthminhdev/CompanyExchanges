import { Module } from '@nestjs/common';
import { ConfigServiceProvider } from './config-module.service';
import { CONFIG_SERVICE } from '../constants';

@Module({
  providers: [
    {
      provide: CONFIG_SERVICE,
      useClass: ConfigServiceProvider,
    },
    ConfigServiceProvider,
  ],
  exports: [ConfigModuleModule, ConfigServiceProvider],
})
export class ConfigModuleModule {}
