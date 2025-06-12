import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    description:
      'The unique identifier of the user, which can be an email address or a user ID',
  })
  identifier: string;

  @ApiProperty({
    description:
      'Specifies the type of the identifier provided, either "email" for email addresses or "user_id" for user IDs',
    enum: ['email', 'user_id'],
  })
  identifierType: 'email' | 'user_id';
}
