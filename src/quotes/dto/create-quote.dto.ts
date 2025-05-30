import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuote {
  @IsNotEmpty()
  @IsString()
  quote_details: string;
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected', 'expired'])
  status?: string;

  @IsOptional()
  @IsNumber()
  estimated_cost?: number;

  @IsOptional()
  valid_until?: Date;

  @IsOptional()
  @IsString()
  quote_type?: string;

  @IsOptional()
  attachments?: string[];
}
