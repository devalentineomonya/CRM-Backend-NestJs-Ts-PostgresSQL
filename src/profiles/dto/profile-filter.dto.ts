import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProfileFilterDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsIn(['en', 'es', 'fr', 'de', 'sw', 'other'])
  language?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  age_min?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  age_max?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;
}
