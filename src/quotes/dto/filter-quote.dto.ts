import {
  IsOptional,
  IsIn,
  IsNumber,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteFilter {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'expired'])
  status?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  min_cost?: number;

  @IsOptional()
  @Type(() => Number)
  max_cost?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  sort_by?: string = 'requested_date';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  quote_type?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
