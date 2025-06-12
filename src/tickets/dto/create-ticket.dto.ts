import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTicketDto {
  @ApiProperty({
    description: 'The issue description',
    example: 'System crash on login',
  })
  @IsNotEmpty()
  @IsString()
  issue: string;
}
