import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { CatchException } from "../exceptions/common.exception";
import {QueueEnum} from "../enums/queue.enum";

@Injectable()
export class QueueService {
  logger = new Logger('QueueService');
  constructor(@InjectQueue(QueueEnum.MainProcessor) private readonly mainQueue: Queue) {}

  async addJob(name: string, data: any, delay: number): Promise<void> {
    try {
      await this.mainQueue.add(name, data, {delay: delay});
    } catch (e) {
      throw new CatchException(e)
    }
  }
}
