import {
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
import { LoginPhoneDto } from './dto/login-phone.dto';
import { AUTH_ROUTES } from 'src/common/constants/routes.constant';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
