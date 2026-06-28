import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { DesignationEntity } from 'src/modules/hrm/degignation/entities/degignation.entity';

export enum EmployeeStatus {
  ACTIVE     = 'active',
  INACTIVE   = 'inactive',
  ON_LEAVE   = 'on_leave',
  TERMINATED = 'terminated',
}

export enum EmployeeType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT  = 'contract',
  INTERN    = 'intern',
}

@Entity('employee_profiles')
export class EmployeeProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Auto-generated e.g. EMP-00001
  @Column({ name: 'employee_id', unique: true, nullable: true })
  employee_id: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  date_of_birth: string;

  @Column({ name: 'join_date', type: 'date' })
  join_date: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmployeeType,
    default: EmployeeType.FULL_TIME,
  })
  employment_type: EmployeeType;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary: number;

  @Column({ nullable: true })
  nid: string;

  @Column({ name: 'emergency_contact', nullable: true })
  emergency_contact: string;

  // ─── Designation ──────────────────────────────────────────────────────────
  @Column({ name: 'designation_id', nullable: true })
  designation_id: string;

  @ManyToOne(() => DesignationEntity, (d) => d.employees, { nullable: true })
  @JoinColumn({ name: 'designation_id' })
  designation: DesignationEntity;

  // ─── User (1-to-1) ────────────────────────────────────────────────────────
  @Column({ name: 'user_id', unique: true })
  user_id: string;

  @OneToOne(() => UserEntity, (u) => u.employeeProfile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}