import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
} from 'typeorm';
import { Profile } from './entities/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileFilterDto } from './dto/profile-filter.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const profile = this.profileRepository.create({
      ...createProfileDto,
      user,
    });

    return this.profileRepository.save(profile);
  }

  async findAll(
    filter: ProfileFilterDto,
  ): Promise<{ success: boolean; count: number; data: Profile[] }> {
    const where: FindOptionsWhere<Profile> = {};

    if (filter.city) {
      where.city = Raw((alias) => `${alias} % :city`, { city: filter.city });
    }

    if (filter.state) {
      where.state = Raw((alias) => `${alias} % :state`, {
        state: filter.state,
      });
    }

    if (filter.country) {
      where.country = Raw((alias) => `${alias} % :country`, {
        country: filter.country,
      });
    }

    if (filter.language) {
      where.preferred_language = filter.language;
    }

    if (filter.age_min ?? filter.age_max) {
      const currentDate = new Date();
      const minDate = new Date();
      const maxDate = new Date();

      if (filter.age_min) {
        minDate.setFullYear(currentDate.getFullYear() - filter.age_min - 1);
        where.date_of_birth = LessThanOrEqual(minDate);
      }

      if (filter.age_max) {
        maxDate.setFullYear(currentDate.getFullYear() - filter.age_max);
        where.date_of_birth = MoreThanOrEqual(maxDate);
      }

      if (filter.age_min && filter.age_max) {
        where.date_of_birth = Between(
          new Date(
            currentDate.getFullYear() - filter.age_max - 1,
            currentDate.getMonth(),
            currentDate.getDate(),
          ),
          new Date(
            currentDate.getFullYear() - filter.age_min,
            currentDate.getMonth(),
            currentDate.getDate(),
          ),
        );
      }
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, count] = await this.profileRepository.findAndCount({
      where,
      relations: ['user'],
      skip,
      take: limit,
    });

    return { success: true, data, count };
  }

  async findOne(profileId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { profile_id: profileId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile with ID ${profileId} not found`);
    }

    return profile;
  }

  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { user_id: userId.toString() } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found`);
    }

    return profile;
  }

  async update(
    profileId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findOne(profileId);
    const updated = this.profileRepository.merge(profile, updateProfileDto);
    return this.profileRepository.save(updated);
  }

  async updateByUserId(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findByUserId(userId);
    const updated = this.profileRepository.merge(profile, updateProfileDto);
    return this.profileRepository.save(updated);
  }

  async remove(profileId: string): Promise<void> {
    const profile = await this.findOne(profileId);
    await this.profileRepository.remove(profile);
  }
}
