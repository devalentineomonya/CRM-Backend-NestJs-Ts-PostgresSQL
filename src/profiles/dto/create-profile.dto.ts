import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  IsPostalCode,
  IsIn,
} from 'class-validator';
export class CreateProfileDto {
  @ApiPropertyOptional({ description: 'The address of the user' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'The city of the user' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'The state of the user' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'The country of the user' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'The postal code of the user' })
  @IsPostalCode('any')
  @IsOptional()
  zip_code?: string;

  @ApiPropertyOptional({
    description: 'The preferred language of the user',
    enum: ['en', 'es', 'fr', 'de', 'sw', 'other'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'sw', 'other'])
  preferred_language?: string;

  @ApiPropertyOptional({ description: 'The date of birth of the user' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: Date;

  @ApiPropertyOptional({
    description: 'The social media links of the user',
    type: [String],
  })
  @IsUrl({}, { each: true })
  @IsOptional()
  social_media_links?: string[];
}
