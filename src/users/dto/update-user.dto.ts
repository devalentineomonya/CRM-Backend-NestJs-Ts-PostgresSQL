import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(CreateUserDto)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'password',
    'email',
    'status',
    'account_type',
  ] as const),
) {}
