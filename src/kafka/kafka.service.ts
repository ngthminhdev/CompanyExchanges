import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class KafkaService {
  private logger = new Logger(KafkaService.name);

  constructor() {}
}
