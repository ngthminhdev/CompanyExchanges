import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';
import {BaseModel} from '../../models/base.entity';

@Entity({
  database: 'AUTH',
  name: 'user',
})
export class UserEntity extends BaseModel {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  user_id: number;

  @Index()
  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  email: string;

  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  password: string;

  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  name: string;

  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  avatar: string;

  @Column({
    type: 'date',
    default: '01/01/2000',
  })
  date_of_birth: Date;

  @Index()
  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  phone: string;

  /**
   * Tài Khoản đã xác minh email hay chưa: 0 - chưa, 1 - rồi
   */
  @Column({
    type: 'tinyint',
    default: 0,
  })
  is_verified: number;

  /**
   * Tài khoản có đăng ký nhận email khuyến mãi... hay không: 0 - không, 1 - có
   */
  @Column({
    type: 'tinyint',
    default: 0,
  })
  is_receive_email: number;

  @Column({
    type: 'tinyint',
    default: 0, //0 - user, 1 - admin
  })
  role: number;

  // @OneToOne(() => CityEntity)
  // @JoinColumn({
  //     referencedColumnName: 'city_id',
  //     name: 'city_id',
  // })
  // city: CityEntity;

  // @OneToOne(() => DistrictEntity)
  // @JoinColumn({
  //     name: 'district_id',
  //     referencedColumnName: 'district_id',
  // })
  // district: DistrictEntity;

  // @OneToOne(() => WardEntity)
  // @JoinColumn({
  //     name: 'ward_id',
  //     referencedColumnName: 'ward_id',
  // })
  // ward: WardEntity;

  @Column({
    type: 'nvarchar',
    length: '255',
    default: '',
  })
  address: string;
}
