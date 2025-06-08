import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileFilterDto {
  @ApiPropertyOptional({ description: 'City of the profile' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State of the profile' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Country of the profile' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Language of the profile',
    enum: ['en', 'es', 'fr', 'de', 'sw', 'other'],
  })
  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'sw', 'other'])
  language?: string;

  @ApiPropertyOptional({
    description: 'Minimum age of the profile',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  age_min?: number;

  @ApiPropertyOptional({
    description: 'Maximum age of the profile',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  age_max?: number;

  @ApiPropertyOptional({
    description: 'Limit of profiles per page',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    type: Number,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;
}
