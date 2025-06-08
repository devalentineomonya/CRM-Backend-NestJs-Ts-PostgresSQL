import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { FilterAdminDto } from './dto/filter-admin.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = this.adminRepository.create(createAdminDto);
    return this.adminRepository.save(admin);
  }

  async findAll(
    filter: FilterAdminDto,
  ): Promise<{ success: boolean; data: Admin[]; count: number }> {
    const { search, role, limit, page, sort_by, sort_order } = filter;

    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const baseWhere: FindOptionsWhere<Admin> = {};
    if (role) baseWhere.role = role;

    let where: FindOptionsWhere<Admin>[] | FindOptionsWhere<Admin> = baseWhere;
    if (search) {
      where = [
        { ...baseWhere, first_name: ILike(`%${search}%`) },
        { ...baseWhere, last_name: ILike(`%${search}%`) },
        { ...baseWhere, email: ILike(`%${search}%`) },
      ];
    }

    const [data, count] = await this.adminRepository.findAndCount({
      where,
      order: sort_by ? { [sort_by]: sort_order ?? 'ASC' } : undefined,
      skip,
      take: limit,
    });

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { admin_id: id },
      relations: ['tickets', 'activity_logs'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);
    const updated = this.adminRepository.merge(admin, updateAdminDto);
    return this.adminRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.findOne(id);
    await this.adminRepository.remove(admin);
  }
}
