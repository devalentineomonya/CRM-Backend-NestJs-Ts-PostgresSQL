import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateTicketDto {
  @ApiProperty({
    description: 'The issue description',
    example: 'System crash on login',
  })
  @IsNotEmpty()
  @IsString()
  issue: string;

  @ApiProperty({
    description: 'The ID of the user creating the ticket',
    example: 123,
  })
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: 'The ID of the user assigned to the ticket',
    example: 456,
  })
  @IsOptional()
  assigned_to?: string;
}
