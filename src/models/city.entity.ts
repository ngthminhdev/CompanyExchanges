import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';

@Entity({
  database: 'user',
  name: 'city',
})
export class CityEntity extends BaseModel {
  @PrimaryColumn({
    type: 'int',
  })
  city_id: number;

  @Column({
    type: 'int',
    default: 0,
  })
  country_id: number;

  @Column({
    type: 'varchar',
    default: '',
  })
  name: string;
}
