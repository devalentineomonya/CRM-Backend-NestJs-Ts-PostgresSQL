import { IsOptional, IsString, IsIn, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterAdminDto {
  @ApiPropertyOptional({ description: 'Search term for filtering admins' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Role of the admin to filter by',
    enum: ['support', 'quotation', 'system'],
  })
  @IsOptional()
  @IsIn(['support', 'quotation', 'system'])
  role?: string;

  @ApiPropertyOptional({
    description: 'Limit the number of results',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'first_name',
  })
  @IsOptional()
  @IsString()
  sort_by?: string = 'first_name';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_order?: 'asc' | 'desc' = 'asc';
}
