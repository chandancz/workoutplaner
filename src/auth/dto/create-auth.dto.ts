import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class RegisterDto {

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@mail.com',
    description: 'User email address',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'Password for the account',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;


  @ApiProperty({
    enum: [Role.USER, Role.MACHINE],
    example: Role.USER,
    description: 'Account role (USER or MACHINE)',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

}
