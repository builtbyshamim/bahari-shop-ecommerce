
import { CourierService } from 'src/modules/system-modules/courier-service/entities/courier-service.entity';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';

@Entity('courier_service_tokens')
@Unique(['courier_service_id'])
export class CourierServiceToken {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    api_key: string;

    @Column({ type: 'text', nullable: true })
    secret_key: string;

    @Column({ type: 'text', nullable: true })
    server_generation_token: string;

    @Column({ type: 'text', nullable: true })
    username: string;

    @Column({ type: 'text', nullable: true })
    password: string;

    @Column({
        type: 'int',
        default: 1,
        comment: '0:Inactive, 1:Active',
    })
    status: number;

    // 🔥 courier_service relation
    @ManyToOne(() => CourierService, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'courier_service_id' })
    courier_service: CourierService;

    @Column({ type: 'bigint' })
    courier_service_id: number;

    // 🔥 added_by user relation
    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'added_by' })
    addedByUser: UserEntity;

    @Column({ type: 'uuid' })
    added_by: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
}
