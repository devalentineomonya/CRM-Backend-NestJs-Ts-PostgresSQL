import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivateWithOtpDto {
  @ApiProperty({
    description: 'Specifies the  "email" for email addresses',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'The OTP code sent to the user',
  })
  code?: string;

  @ApiPropertyOptional({
    description: 'The token associated with the OTP, if applicable',
  })
  token?: string;
}
