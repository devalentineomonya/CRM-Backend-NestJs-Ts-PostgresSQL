import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  IsPostalCode,
  IsIn,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsPostalCode('any')
  @IsOptional()
  zip_code?: string;

  @IsString()
  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'sw', 'other'])
  preferred_language?: string;

  @IsDateString()
  @IsOptional()
  date_of_birth?: Date;

  @IsUrl({}, { each: true })
  @IsOptional()
  social_media_links?: string[];
}
