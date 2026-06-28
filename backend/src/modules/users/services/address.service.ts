import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../entities/customer-address.entity';
import { CreateAddressDto, UpdateAddressDto } from '../dto/create-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  async getAll(userId: string) {
    const data = await this.repo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC' },
    });
    return { data };
  }

  async create(userId: string, dto: CreateAddressDto) {
    // If new address is default → unset all others first
    if (dto.isDefault) {
      await this.repo.update({ user: { id: userId } }, { isDefault: false });
    }

    // If this is the first address, force it to be default
    const count = await this.repo.count({ where: { user: { id: userId } } });
    const isDefault = count === 0 ? true : (dto.isDefault ?? false);

    const address = this.repo.create({
      ...dto,
      isDefault,
      user: { id: userId },
    });
    const saved = await this.repo.save(address);
    return { message: 'Address created', data: saved };
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.findOwned(userId, addressId);

    if (dto.isDefault && !address.isDefault) {
      await this.repo.update({ user: { id: userId } }, { isDefault: false });
    }

    Object.assign(address, dto);
    const saved = await this.repo.save(address);
    return { message: 'Address updated', data: saved };
  }

  async setDefault(userId: string, addressId: string) {
    await this.findOwned(userId, addressId); // ownership check
    await this.repo.update({ user: { id: userId } }, { isDefault: false });
    await this.repo.update({ id: addressId }, { isDefault: true });
    return { message: 'Default address updated' };
  }

  async remove(userId: string, addressId: string) {
    const address = await this.findOwned(userId, addressId);
    if (address.isDefault) {
      throw new ForbiddenException('Cannot delete the default address. Set another as default first.');
    }
    await this.repo.remove(address);
    return { message: 'Address deleted' };
  }

  // ── private helper ──────────────────────────────────────────────────────────

  private async findOwned(userId: string, addressId: string): Promise<Address> {
    const address = await this.repo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }
}