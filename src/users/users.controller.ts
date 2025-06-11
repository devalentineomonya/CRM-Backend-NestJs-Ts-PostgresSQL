import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';

@Roles(Role.FREE_USER, Role.PREMIUM_USER, Role.SUPER_ADMIN)
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService
      .create(createUserDto)
      .then((response) => response.data);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(@Query() filter: UserFilterDto) {
    return this.userService.findAll(filter);
  }
  @ApiBearerAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<User> {
    this.permissionHelper.checkPermission(id, req.user);

    return this.userService.findOne(id).then((response) => response.data);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    this.permissionHelper.checkPermission(id, req.user);
    return this.userService
      .update(id, updateUserDto)
      .then((response) => response.data);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch('account-type')
  async updateAccountType(@Body() updateAccountTypeDto: UpdateAccountTypeDto) {
    return this.userService.updateAccountType(updateAccountTypeDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch('status')
  async updateStatus(@Body() updateStatusDto: UpdateUserStatusDto) {
    return this.userService.updateStatus(updateStatusDto);
  }

  @Roles(Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.userService.remove(id);
  }
}
