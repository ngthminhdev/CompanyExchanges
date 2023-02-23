import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseModel extends BaseEntity {
  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  timestamp: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
