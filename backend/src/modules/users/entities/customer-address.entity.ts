import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne

} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, (user) => user.addresses, {
        onDelete: 'CASCADE',
    })
    user: UserEntity;

    @Column()
    fullName: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column()
    fullAddress: string;

    @Column({ default: false })
    isDefault: boolean;
}