import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';

@Entity({
  database: 'user',
  name: 'district',
})
export class DistrictEntity extends BaseModel {
  @PrimaryColumn({
    type: 'int',
  })
  district_id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  city_id: number;

  @Column({
    type: 'varchar',
    default: '',
  })
  name: string;
}
