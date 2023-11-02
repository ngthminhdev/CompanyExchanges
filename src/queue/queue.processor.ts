import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { InjectRepository } from "@nestjs/typeorm";
import { VerifyEntity } from "../auth/entities/verify.entity";
import { Repository } from "typeorm";
import {QueueEnum} from "../enums/queue.enum";
import { DB_SERVER } from "../constants";

@Processor(QueueEnum.MainProcessor)
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);
  constructor(
    @InjectRepository(VerifyEntity, DB_SERVER)
    private readonly verifyRepo: Repository<VerifyEntity>,
  ) {
  }

  @Process('delete-expired-otp')
  async handleJob(job: Job<any>): Promise<void> {
    this.logger.debug('Start processing job');
    // Xử lý công việc ở đây
    const verifyEntity: VerifyEntity = job.data;
    await this.verifyRepo.delete({id: verifyEntity.id});

    this.logger.debug('Finished processing job');
  }

}