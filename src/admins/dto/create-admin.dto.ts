import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ description: 'First name of the admin', example: 'John' })
  first_name: string;

  @ApiProperty({ description: 'Last name of the admin', example: 'Doe' })
  last_name: string;

  @ApiProperty({
    description: 'Password of the admin',
    example: 'securePassword123',
    writeOnly: true,
  })
  password: string;

  @ApiProperty({
    description: 'Email of the admin',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role of the admin',
    example: 'support',
    default: 'support',
    enum: ['support', 'quotation', 'system'],
  })
  @IsIn(['support', 'system', 'quotation'])
  role: string;
}
