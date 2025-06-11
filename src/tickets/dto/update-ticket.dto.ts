import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(CreateTicketDto)
export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
