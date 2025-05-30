import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  issue: string;

  @IsOptional()
  @IsString()
  priority_level?: 'low' | 'medium' | 'high';

  @IsNotEmpty()
  user_id: number;

  @IsOptional()
  assigned_to?: number;
}
