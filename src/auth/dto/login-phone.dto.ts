import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class LoginPhoneDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Optional name for creating a user if it does not exist',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: '555123456',
    description: 'Phone number without country code',
    minLength: 5,
    maxLength: 15,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Phone number must contain only digits' })
  @MinLength(5)
  @MaxLength(15)
  phone: string;

  @ApiProperty({
    example: '+1',
    description: 'Phone country code starting with + followed by digits',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+\d{1,4}$/, { message: 'Country code must start with + and contain digits' })
  countryCode: string;
}
