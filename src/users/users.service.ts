import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    filter: UserFilterDto,
  ): Promise<{ success: boolean; data: User[]; count: number }> {
    const { search, status, account_type, limit, page, sort_by, sort_order } =
      filter;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (status || account_type) {
      where = {
        ...(status && { status }),
        ...(account_type && { account_type }),
      };
    }

    if (search) {
      where = [
        { first_name: ILike(`%${search}%`), ...(where as object) },
        { last_name: ILike(`%${search}%`), ...(where as object) },
        { email: ILike(`%${search}%`), ...(where as object) },
      ];
    }

    const [data, count] = await this.userRepository.findAndCount({
      where,
      order: sort_by ? { [sort_by]: sort_order } : undefined,
      skip,
      take: limit,
    });

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<{ success: boolean; data: User }> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { success: true, data: user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);
    return { success: true, data: savedUser };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = this.userRepository.merge(user.data, updateUserDto);
    const savedUser = await this.userRepository.save(updated);
    return { success: true, data: savedUser };
  }

  async updateAccountType(
    updateAccountTypeDto: UpdateAccountTypeDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, accountType } = updateAccountTypeDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.account_type = accountType;
    const updatedUser = await this.userRepository.save(user);

    return { success: true, data: updatedUser };
  }

  async updateStatus(
    updateStatusDto: UpdateUserStatusDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, status } = updateStatusDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.status = status;
    const updatedUser = await this.userRepository.save(user);

    return { success: true, data: updatedUser };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user.data);
    return { success: true };
  }
}
