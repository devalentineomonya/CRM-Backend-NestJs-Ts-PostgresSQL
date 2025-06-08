import { IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserFilterDto {
  @ApiPropertyOptional({ description: 'Search term for filtering users' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Status of the user',
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Type of user account',
    enum: ['free', 'premium'],
  })
  @IsOptional()
  @IsIn(['free', 'premium'])
  account_type?: string;

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

  @ApiPropertyOptional({ description: 'Field to sort by', default: 'user_id' })
  @IsOptional()
  sort_by?: string = 'user_id';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'ASC';
}
