import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';

@Entity({
  database: 'user',
  name: 'ward',
})
export class WardEntity extends BaseModel {
  @Column({
    type: 'int',
  })
  district_id: number;

  @PrimaryColumn({
    type: 'int',
    default: 0,
  })
  ward_id: number;

  @Column({
    type: 'nvarchar',
    default: '',
  })
  name: string;
}
