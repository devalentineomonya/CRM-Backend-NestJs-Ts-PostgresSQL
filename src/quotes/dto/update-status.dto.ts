import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum QuoteStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export class UpdateQuoteStatusDto {
  @IsEnum(QuoteStatus)
  @ApiProperty({
    enum: QuoteStatus,
    description: 'The status of the quote',
    enumName: 'QuoteStatus',
  })
  status: QuoteStatus;
}
