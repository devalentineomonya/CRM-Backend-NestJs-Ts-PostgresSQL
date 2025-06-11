import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserVisitDto {
  @ApiProperty({ description: 'The IP address of the user visit' })
  @IsString()
  @IsNotEmpty()
  ip_address: string;

  @ApiPropertyOptional({
    description: 'The type of device used during the visit',
  })
  @IsString()
  @IsOptional()
  device_type?: string;

  @ApiPropertyOptional({
    description: 'The user agent string of the browser or device',
  })
  @IsString()
  @IsOptional()
  user_agent?: string;
}
