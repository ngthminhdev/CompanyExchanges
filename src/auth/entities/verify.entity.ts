import { Column, Entity, Generated, Index, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { BaseModel } from "../../models/base.entity";
import { UserEntity } from "../../user/entities/user.entity";

@Entity({
    database: 'AUTH',
    name: 'verify_otp',
})
export class VerifyEntity extends BaseModel {
    @PrimaryColumn({type: 'uuid'})
    @Generated('uuid')
    id: string;

    @OneToOne(() => UserEntity)
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @Column({
        type: 'integer'
    })
    user_id: number;

    @Index()
    @Column({
        type: 'nvarchar',
        length: '6',
        default: '',
    })
    verify_otp: string;



}
