import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    description: 'The email of the user to resend otp to',
  })
  email: string;
}
