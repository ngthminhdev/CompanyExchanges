import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseModel } from './base.entity';

@Entity({
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
    type: 'text',
    default: '',
  })
  name: string;
}
