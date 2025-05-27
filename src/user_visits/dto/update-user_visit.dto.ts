import { PartialType } from '@nestjs/mapped-types';
import { CreateUserVisitDto } from './create-user_visit.dto';

export class UpdateUserVisitDto extends PartialType(CreateUserVisitDto) {}
