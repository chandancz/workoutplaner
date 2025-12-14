import { IsEmail, IsNumber } from 'class-validator';

export class VerifysOtpDto {
  @IsEmail()
  email: string;

  @IsNumber()
  otp: number;
}
