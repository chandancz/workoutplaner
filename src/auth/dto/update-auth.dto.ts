import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Updated name of the user',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, New York, USA',
    description: 'User residential address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable notifications',
  })
  @IsOptional()
  @IsBoolean()
  notificationOn?: boolean;

  @ApiPropertyOptional({
    example: 'fcm_device_token_xyz',
    description: 'FCM device token for push notifications',
  })
  @IsOptional()
  @IsString()
  deviceToken?: string;
}