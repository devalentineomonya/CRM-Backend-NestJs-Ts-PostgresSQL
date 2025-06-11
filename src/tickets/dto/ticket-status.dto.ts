import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class TicketStatusDto {
  @ApiProperty({
    description:
      'The current status of the ticket, which can be open, in-progress, or closed.',
    enum: ['open', 'in-progress', 'closed'],
    example: 'in-progress',
  })
  @IsString()
  @IsIn(['open', 'in-progress', 'closed'])
  ticket_status: 'open' | 'in-progress' | 'closed';
}
