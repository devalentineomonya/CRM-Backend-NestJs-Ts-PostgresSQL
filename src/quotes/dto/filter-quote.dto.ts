import {
  IsOptional,
  IsIn,
  IsNumber,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuoteFilter {
  @ApiPropertyOptional({ description: 'ID of the user' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Status of the quote',
    enum: ['pending', 'approved', 'rejected', 'expired'],
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'expired'])
  status?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering quotes' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for filtering quotes' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Minimum cost of the quote' })
  @IsOptional()
  @Type(() => Number)
  min_cost?: number;

  @ApiPropertyOptional({ description: 'Maximum cost of the quote' })
  @IsOptional()
  @Type(() => Number)
  max_cost?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'requested_date',
  })
  @IsOptional()
  sort_by?: string = 'requested_date';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Type of the quote' })
  @IsOptional()
  @IsString()
  quote_type?: string;

  @ApiPropertyOptional({ description: 'Search term for filtering quotes' })
  @IsOptional()
  @IsString()
  search?: string;
}
