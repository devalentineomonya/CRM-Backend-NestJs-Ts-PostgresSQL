import { IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TicketFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['open', 'in-progress', 'closed'])
  ticket_status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority_level?: string;

  @IsOptional()
  @IsNumber()
  user_id?: string;

  @IsOptional()
  @IsNumber()
  assigned_to?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  sort_by?: string = 'created_date';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}
