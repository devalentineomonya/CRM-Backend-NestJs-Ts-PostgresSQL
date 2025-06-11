import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountTypeDto {
  @ApiProperty({ description: 'The unique identifier of the user' })
  userId: string;

  @ApiProperty({
    description: 'The new account type for the user',
    enum: ['free', 'premium'],
  })
  accountType: 'free' | 'premium';
}
