import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProfileService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileFilterDto } from './dto/profile-filter.dto';
import { Profile } from './entities/profile.entity';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @ApiBearerAuth()
  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    return this.profileService.create(userId, createProfileDto);
  }
  @ApiBearerAuth()
  @Get()
  findAll(
    @Query() filter: ProfileFilterDto,
  ): Promise<{ success: boolean; count: number; data: Profile[] }> {
    return this.profileService.findAll(filter);
  }
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Profile> {
    return this.profileService.findOne(id);
  }
  @ApiBearerAuth()
  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<Profile> {
    return this.profileService.findByUserId(userId);
  }
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profileService.update(id, updateProfileDto);
  }
  @ApiBearerAuth()
  @Patch('user/:userId')
  updateByUserId(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    return this.profileService.updateByUserId(userId, updateProfileDto);
  }
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.profileService.remove(id);
  }
}
