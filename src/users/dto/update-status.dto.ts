import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  userId: string;

  @ApiProperty({
    description: 'The new account type for the user',
    enum: ['active', 'inactive'],
  })
  status: 'active' | 'inactive';
}
