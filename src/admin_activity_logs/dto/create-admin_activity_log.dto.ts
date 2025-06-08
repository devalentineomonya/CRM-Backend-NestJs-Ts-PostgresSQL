import { IsString, IsIP, IsOptional, IsInt } from 'class-validator';

export class CreateAdminActivityLogDto {
  @IsString()
  action_type: string;

  @IsOptional()
  @IsString()
  action_details?: string;

  @IsIP()
  ip_address: string;

  @IsOptional()
  @IsString()
  target_entity?: string;

  @IsOptional()
  @IsInt()
  target_id?: number;
}
