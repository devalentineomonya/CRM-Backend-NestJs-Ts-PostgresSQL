import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuote {
  @ApiProperty({ description: 'Details of the quote' })
  @IsNotEmpty()
  @IsString()
  quote_details: string;

  @ApiPropertyOptional({
    description: 'Status of the quote',
    enum: ['pending', 'approved', 'rejected', 'expired'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'rejected', 'expired'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Estimated cost of the quote',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  estimated_cost?: number;

  @ApiPropertyOptional({
    description: 'Validity date of the quote',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  valid_until?: Date;

  @ApiPropertyOptional({
    description: 'Type of the quote',
  })
  @IsOptional()
  @IsString()
  quote_type?: string;

  @ApiPropertyOptional({
    description: 'Attachments related to the quote',
    type: [String],
  })
  @IsOptional()
  attachments?: string[];
}
