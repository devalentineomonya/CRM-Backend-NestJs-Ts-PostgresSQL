import { IsOptional, IsIn, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TicketFilterDto {
  @ApiPropertyOptional({
    description: 'Search term for filtering tickets',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Status of the ticket',
    enum: ['open', 'in-progress', 'closed'],
  })
  @IsOptional()
  @IsIn(['open', 'in-progress', 'closed'])
  ticket_status?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the ticket',
    enum: ['low', 'medium', 'high'],
  })
  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority_level?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who created the ticket',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to the ticket',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  assigned_to?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
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

  @ApiPropertyOptional({
    description: 'Field to sort by',
    type: String,
    default: 'created_date',
  })
  @IsOptional()
  sort_by?: string = 'created_date';

  @ApiPropertyOptional({
    description: 'Order of sorting',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';
}
