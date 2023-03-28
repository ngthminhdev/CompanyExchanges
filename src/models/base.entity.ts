import { BaseEntity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class BaseModel extends BaseEntity {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
