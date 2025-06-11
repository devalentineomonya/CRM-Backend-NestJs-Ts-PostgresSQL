import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ProfileService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileFilterDto } from './dto/profile-filter.dto';
import { Profile } from './entities/profile.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';

@Roles(Role.FREE_USER, Role.PREMIUM_USER, Role.SUPER_ADMIN)
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @ApiBearerAuth()
  @Post(':userId')
  create(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<Profile> {
    this.permissionHelper.checkPermission(userId, req.user);
    return this.profileService.create(userId, createProfileDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(
    @Query() filter: ProfileFilterDto,
  ): Promise<{ success: boolean; count: number; data: Profile[] }> {
    return this.profileService.findAll(filter);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<Profile> {
    this.permissionHelper.checkPermission(id, req.user);
    return this.profileService.findOne(id);
  }

  @ApiBearerAuth()
  @Get('user/:userId')
  findByUserId(
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<Profile> {
    this.permissionHelper.checkPermission(userId, req.user);
    return this.profileService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<Profile> {
    this.permissionHelper.checkPermission(id, req.user);
    this.permissionHelper.checkPermission(id, req.user);
    return this.profileService.update(id, updateProfileDto);
  }

  @ApiBearerAuth()
  @Patch('user/:userId')
  updateByUserId(
    @Param('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: RequestWithUser,
  ): Promise<Profile> {
    this.permissionHelper.checkPermission(userId, req.user);
    return this.profileService.updateByUserId(userId, updateProfileDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.profileService.remove(id);
  }
}
