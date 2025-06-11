import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profiles.service';
import { ProfileController } from './profiles.controller';
import { Profile } from './entities/profile.entity';
import { User } from 'src/users/entities/user.entity';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  controllers: [ProfileController],
  providers: [ProfileService, PermissionHelper],
})
export class ProfileModule {}
