import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class TicketPriorityDto {
  @ApiProperty({
    description: 'The priority level of the ticket',
    example: 'high',
    enum: ['low', 'medium', 'high'],
  })
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  priority_level: 'low' | 'medium' | 'high';
}
