import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserEntity } from "../../user/entities/user.entity"
import {BaseModel} from '../../models/base.entity';

@Entity({
    name: 'filter_user',
    database: 'AUTH'
})
export class FilterUserEntity extends BaseModel {
    @PrimaryGeneratedColumn('increment', {
        type: 'int',
      })
    filter_id: number

    @Column({
        type: 'nvarchar',
        length: '255',
        default: '',
    })
    name: string

    @ManyToOne(() => UserEntity, (user) => user.user_id)
    @JoinColumn({name: 'user_id'})
    user: UserEntity

    @Column({
        type: 'nvarchar',
        length: 'max'
    })
    value: string
}

interface IValueFilter {
    key: string
    min: number
    max: number
}