import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/create-auth.dto';
import { UpdateProfileDto } from './dto/update-auth.dto';
import { LoginPhoneDto, VerifyOtpDto } from './dto/login-phone.dto';
import { AUTH_ROUTES } from 'src/common/constants/routes.constant';
import { AuthGuard } from '@nestjs/passport';
import { RedisOtpService } from 'src/redis/redis-otp.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisOtpService: RedisOtpService,
  ) { }

  @Post(AUTH_ROUTES.REGISTER)
  @ApiOperation({ summary: 'Register new user' })
  create(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post(AUTH_ROUTES.PHONE_LOGIN)
  @ApiOperation({ summary: 'Login or Register with phone number' })
  phoneLoginAndRegister(@Body() dto: LoginPhoneDto) {
    return this.authService.phoneLoginOrRegister(dto);
  }

  @Post(AUTH_ROUTES.LOGIN)
  @ApiOperation({ summary: 'Login user' })
  loginUser(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post(AUTH_ROUTES.SEND_OTP)
  async sendOtp(@Body() dto: LoginPhoneDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisOtpService.storeOtp(dto.phone, dto.countryCode, otp,);
    console.log('OTP sent:', otp);
    return { message: 'OTP sent successfully',otp };
  }

  @Post(AUTH_ROUTES.VERIFY_OTP)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtpAndLogin(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(AUTH_ROUTES.PROFILE)
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Req() req) {
    return this.authService.findById(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Patch(AUTH_ROUTES.PROFILE)
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.authService.update(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post(AUTH_ROUTES.LOGOUT)
  @ApiOperation({ summary: 'Logout user' })
  logout(@Req() req) {
    return this.authService.update(req.user.id, { deviceToken: null });
  }
}
