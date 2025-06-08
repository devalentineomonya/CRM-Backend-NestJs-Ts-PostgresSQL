import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserVisitDto {
  @ApiProperty({ description: 'The IP address of the user visit' })
  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'The type of device used during the visit',
  })
  @IsString()
  @IsOptional()
  deviceType?: string;

  @ApiPropertyOptional({
    description: 'The user agent string of the browser or device',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
