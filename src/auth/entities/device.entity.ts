import {Column, Entity, Generated, ManyToOne, PrimaryColumn,} from 'typeorm';
import {BaseModel} from '../../models/base.entity';
import {UserEntity} from '../../user/entities/user.entity';

@Entity({
    database: 'AUTH',
    name: 'device',
})
export class DeviceEntity extends BaseModel {
    @PrimaryColumn({type: 'uuid'})
    @Generated('uuid')
    id: string;

    @Column({
        type: 'nvarchar',
        length: '255'
    })
    mac_id: string;

    @Column({
        type: 'nvarchar',
        length: '255'
    })
    device_id: string;

    @Column({
        type: 'nvarchar',
        length: '255',
        default: '',
    })
    user_agent: string;

    @Column({
        type: 'nvarchar',
        length: '255',
        default: '',
    })
    secret_key: string;

    @Column({
        type: 'nvarchar',
        length: '610',
        default: '',
    })
    refresh_token: string;

    @Column({
        type: 'datetime'
    })
    expired_at: Date;

    @Column({
        type: 'nvarchar',
        length: '255',
    })
    ip_address: string;

    @ManyToOne(() => UserEntity, (user) => user.devices)
    user: UserEntity
}
