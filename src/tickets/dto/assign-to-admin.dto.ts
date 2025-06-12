import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AssignAdminDto {
  @ApiProperty({
    description: 'The ID of the admin to assign to the ticket',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  admin_id: string;
}
