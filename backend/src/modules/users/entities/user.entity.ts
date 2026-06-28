import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  OneToOne,
  BeforeInsert,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { RefreshTokenEntity } from 'src/modules/auth/entities/refresh-token.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Exclude } from 'class-transformer';
import { Address } from './customer-address.entity';
import { EmployeeProfileEntity } from 'src/modules/hrm/employee/entities/employee-profile.entity';

@Entity('users')
@Index(['email', 'phone'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  userId: string;

  @BeforeInsert()
  generateUserId() {
    const timestamp = Date.now().toString().slice(-5);
    this.userId = `USR-${timestamp}`;
  }

  @ApiProperty({ example: 'user@example.com' })
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string | null;

  @ApiProperty({ example: '01214745841' })
  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string | null;

  @ApiProperty({ example: 'Md. Shamim Hossain' })
  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @ApiProperty({ example: 'Dhaka, Bangladesh' })
  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_verified?: boolean;

  @Column({ type: 'boolean', default: true })
  acceptTerms?: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  isBanned?: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  isDeleted?: boolean;

  @Column({ type: 'varchar', nullable: true })
  fcmToken: string | null;

  // ── Relations ─────────────────────────────────────────────────────────────
  @OneToMany(() => RefreshTokenEntity, (r) => r.user)
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => Order, (o) => o.customer)
  order: Order;

  @OneToMany(() => Address, (a) => a.user)
  addresses: Address;

  /** HRM profile — only exists when role = EMPLOYEE */
  @OneToOne(() => EmployeeProfileEntity, (p) => p.user)
  employeeProfile: EmployeeProfileEntity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
