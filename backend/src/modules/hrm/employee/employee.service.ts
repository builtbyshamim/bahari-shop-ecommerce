import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { EmployeeProfileEntity, EmployeeStatus } from './entities/employee-profile.entity';
import { UserRole } from 'src/common/shared/enums/user-role.enum';
import { CreateEmployeeDto, EmployeeFilterDto, UpdateEmployeeDto } from './dto/employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(EmployeeProfileEntity)
    private readonly profileRepo: Repository<EmployeeProfileEntity>,
  ) {}

  // ─── Generate EMP-XXXXX ───────────────────────────────────────────────────
  private async generateEmployeeId(): Promise<string> {
    const last = await this.profileRepo.findOne({
      where: {},
      order: { created_at: 'DESC' },
    });
    if (!last?.employee_id) return 'EMP-00001';
    const num = parseInt(last.employee_id.replace('EMP-', ''), 10);
    return `EMP-${String(num + 1).padStart(5, '0')}`;
  }

  // ─── Load one with both user + profile ────────────────────────────────────
  private async loadOne(userId: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id: userId, role: UserRole.EMPLOYEE },
      relations: { employeeProfile: { designation: true } },
    });
    if (!user) throw new NotFoundException(`Employee not found`);
    return user;
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(dto: CreateEmployeeDto): Promise<UserEntity> {
    // 1. Email uniqueness check
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException(`Email "${dto.email}" already registered`);

    // 2. Create user account
    const hashedPassword = await bcrypt.hash(dto.password || 'Employee@1234', 10);
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      name: dto.full_name,
      address: dto.address,
      avatar: dto.avatar,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
      is_verified: true,
    });
    const savedUser = await this.userRepo.save(user);

    // 3. Create employee profile
    const employee_id = await this.generateEmployeeId();
    const profile = this.profileRepo.create({
      user_id: savedUser.id,
      employee_id,
      date_of_birth: dto.date_of_birth,
      join_date: dto.join_date,
      employment_type: dto.employment_type,
      status: dto.status,
      salary: dto.salary,
      nid: dto.nid,
      emergency_contact: dto.emergency_contact,
      designation_id: dto.designation_id,
    });
    await this.profileRepo.save(profile);

    return this.loadOne(savedUser.id);
  }

  // ─── FIND ALL ─────────────────────────────────────────────────────────────
  async findAll(filter: EmployeeFilterDto) {
    const { search, status, employment_type, designation_id, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    // Query on users table joined with profile
    const qb = this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.employeeProfile', 'p')
      .select('u.id')
      .where('u.role = :role', { role: UserRole.EMPLOYEE })
      .andWhere('(u.isDeleted = false OR u.isDeleted IS NULL)')
      .orderBy('u.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      qb.andWhere(
        '(u.name ILIKE :s OR u.email ILIKE :s OR p.employee_id ILIKE :s OR u.phone ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status)         qb.andWhere('p.status = :status', { status });
    if (employment_type) qb.andWhere('p.employment_type = :employment_type', { employment_type });
    if (designation_id)  qb.andWhere('p.designation_id = :designation_id', { designation_id });

    // Count
    const countQb = this.userRepo
      .createQueryBuilder('u')
      .innerJoin('u.employeeProfile', 'p')
      .select('COUNT(u.id)', 'count')
      .where('u.role = :role', { role: UserRole.EMPLOYEE })
      .andWhere('(u.isDeleted = false OR u.isDeleted IS NULL)');

    if (search) {
      countQb.andWhere(
        '(u.name ILIKE :s OR u.email ILIKE :s OR p.employee_id ILIKE :s OR u.phone ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status)         countQb.andWhere('p.status = :status', { status });
    if (employment_type) countQb.andWhere('p.employment_type = :employment_type', { employment_type });
    if (designation_id)  countQb.andWhere('p.designation_id = :designation_id', { designation_id });

    const [rawIds, countResult] = await Promise.all([
      qb.getRawMany(),
      countQb.getRawOne(),
    ]);

    const ids = rawIds.map((r) => r.u_id);
    const total = Number(countResult?.count ?? 0);

    let data: UserEntity[] = [];
    if (ids.length > 0) {
      data = await this.userRepo.find({
        where: ids.map((id) => ({ id })),
        relations: { employeeProfile: { designation: true } },
        order: { createdAt: 'DESC' },
      });
    }

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<UserEntity> {
    return this.loadOne(id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateEmployeeDto): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id, role: UserRole.EMPLOYEE },
    });
    if (!user) throw new NotFoundException(`Employee not found`);

    const profile = await this.profileRepo.findOne({ where: { user_id: id } });
    if (!profile) throw new NotFoundException(`Employee profile not found`);

    // Check email uniqueness
    if (dto.email && dto.email !== user.email) {
      const emailTaken = await this.userRepo.findOne({ where: { email: dto.email } });
      if (emailTaken) throw new BadRequestException(`Email "${dto.email}" already in use`);
    }

    // Update user fields
    if (dto.full_name)  { user.name = dto.full_name; }
    if (dto.email)        user.email = dto.email;
    if (dto.phone !== undefined)   user.phone = dto.phone;
    if (dto.address !== undefined) user.address = dto.address;
    if (dto.avatar !== undefined)  user.avatar = dto.avatar;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
    await this.userRepo.save(user);

    // Update profile fields
    if (dto.date_of_birth !== undefined)  profile.date_of_birth = dto.date_of_birth;
    if (dto.join_date !== undefined)      profile.join_date = dto.join_date;
    if (dto.employment_type !== undefined) profile.employment_type = dto.employment_type;
    if (dto.status !== undefined)         profile.status = dto.status;
    if (dto.salary !== undefined)         profile.salary = dto.salary;
    if (dto.nid !== undefined)            profile.nid = dto.nid;
    if (dto.emergency_contact !== undefined) profile.emergency_contact = dto.emergency_contact;
    if (dto.designation_id !== undefined)    profile.designation_id = dto.designation_id;
    await this.profileRepo.save(profile);

    return this.loadOne(id);
  }

  // ─── DELETE (soft) ────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id, role: UserRole.EMPLOYEE } });
    if (!user) throw new NotFoundException(`Employee not found`);

    const profile = await this.profileRepo.findOne({ where: { user_id: id } });

    user.isDeleted = true;
    await this.userRepo.save(user);

    if (profile) {
      profile.status = EmployeeStatus.TERMINATED;
      await this.profileRepo.save(profile);
    }

    return { message: 'Employee removed successfully' };
  }

  // ─── STATS ────────────────────────────────────────────────────────────────
  async getStats() {
    const raw = await this.profileRepo
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .select('p.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('u.isDeleted = false OR u.isDeleted IS NULL')
      .groupBy('p.status')
      .getRawMany();

    const total = await this.profileRepo
      .createQueryBuilder('p')
      .innerJoin('p.user', 'u')
      .where('u.isDeleted = false OR u.isDeleted IS NULL')
      .getCount();

    const stats: Record<string, number> = { total };
    raw.forEach((r) => { stats[r.status ?? 'unknown'] = Number(r.count); });
    return stats;
  }
}