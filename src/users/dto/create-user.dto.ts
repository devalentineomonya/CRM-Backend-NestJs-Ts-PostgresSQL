import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ description: 'The first name of the user' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'The last name of the user' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password for the user account' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'The profile picture URL of the user',
  })
  @IsOptional()
  profile_picture?: string;

  @ApiPropertyOptional({
    description: 'The status of the user',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({
    description: 'The account type of the user',
    enum: ['free', 'premium'],
  })
  @IsOptional()
  @IsIn(['free', 'premium'])
  account_type?: string;
}
