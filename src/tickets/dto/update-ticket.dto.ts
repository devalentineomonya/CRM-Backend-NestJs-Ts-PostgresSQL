import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(CreateTicketDto)
export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional({
    description:
      'The current status of the ticket, which can be open, in-progress, or closed.',
    enum: ['open', 'in-progress', 'closed'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['open', 'in-progress', 'closed'])
  ticket_status?: 'open' | 'in-progress' | 'closed';
}
