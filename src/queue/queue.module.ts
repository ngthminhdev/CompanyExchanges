import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { BullModule } from "@nestjs/bull";
import { ConfigModuleModule } from "../config-module/config-module.module";
import { ConfigServiceProvider } from "../config-module/config-module.service";
import { QueueProcessor } from "./queue.processor";
import { TypeOrmModule } from "@nestjs/typeorm";
import { VerifyEntity } from "../auth/entities/verify.entity";
import {QueueEnum} from "../enums/queue.enum";

@Module({
  imports: [
    TypeOrmModule.forFeature([VerifyEntity]),
    //queue
    BullModule.forRootAsync({
      imports: [ConfigModuleModule],
      useFactory: (config: ConfigServiceProvider) => config.createBullOptions(),
      inject: [ConfigServiceProvider]
    }),
    BullModule.registerQueue(
      {name: QueueEnum.MainProcessor}
    )
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueModule, QueueService, QueueProcessor]
})
export class QueueModule {}
