import { ApiExtraModels, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

@ApiExtraModels(CreateUserDto)
export class UpdateUserDto extends PartialType(CreateUserDto) {}
