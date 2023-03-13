import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseModel } from '../../models/base.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({
  database: 'AUTH',
  name: 'auth',
})
export class AuthEntity extends BaseModel {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  auth_id: number;

  @OneToOne(() => UserEntity)
  @JoinColumn({
    referencedColumnName: 'user_id',
    name: 'user_id',
  })
  user: UserEntity;

  @Index()
  @Column({
    type: 'nvarchar',
    length: '610',
    default: '',
  })
  access_token: string;

  @Index()
  @Column({
    type: 'nvarchar',
    length: '610',
    default: '',
  })
  refresh_token: string;

  @Index()
  @Column({
    type: 'nvarchar',
    length: '610',
    default: '',
  })
  verified_token: string;

  @Index()
  @Column({
    type: 'smallint',
    default: 1,
  })
  status: number; // 0 - not valid, 1 - valid
}
