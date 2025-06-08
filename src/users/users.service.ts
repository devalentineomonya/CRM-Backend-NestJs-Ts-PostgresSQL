import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

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
      where: { user_id: id.toString() },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { success: true, data: user };
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

  async remove(id: string): Promise<{ success: boolean }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user.data);
    return { success: true };
  }
}
