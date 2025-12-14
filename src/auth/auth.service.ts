import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { LoginPhoneDto } from './dto/login-phone.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  // USER REGISTER
  async register(dto: RegisterDto) {
    const exist = await this.usersService.findByEmail(dto.email);

    if (exist) {
      throw new BadRequestException('Email already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      ...dto,
      password: hashed,
    });
    const isNewUser = false

    return this.signToken(user, isNewUser);
  }

  async phoneLoginOrRegister(dto: LoginPhoneDto) {
    let user = await this.usersService.findByPhone(dto.phone, dto.countryCode);
    let isNewUser = false
    if (!user) {
      try {
        user = await this.usersService.create(dto);
        isNewUser=true
      } catch (error) {
        if (error.code === 11000) {
          user = await this.usersService.findByPhone(dto.phone, dto.countryCode);
        } else {
          throw error;
        }
      }
    }

    return this.generateAuthResponse(user,isNewUser);
  }

  private generateAuthResponse(user: any,isNewUser) {
    const payload = {
      sub: user._id,
      phone: user.phone,
      countryCode: user.countryCode,
      email: user.email ?? null,
    };

    return {
      message: user.name ? "Login Successful" : "Signup Successful",
      isNewUser: isNewUser,
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        countryCode: user.countryCode,
        email: user.email ?? null,
      },
    };
  }


  private signToken(user: any, isNewUser: boolean) {
    const payload = {
      sub: user._id,
      phone: user.phone,
      countryCode: user.countryCode,
      email: user.email ?? null,
    };

    return {
      access_token: this.jwtService.sign(payload),
      isNewUser,
      user: {
        id: user._id,
        phone: user.phone,
        countryCode: user.countryCode,
        email: user.email ?? null,
        name: user.name ?? null,
      },
    };
  }



  // USER LOGIN
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const match = await bcrypt.compare(dto.password, user?.password);

    if (!match) throw new UnauthorizedException('Invalid email or password');
    const isNewUser = false
    return this.signToken(user, isNewUser);
  }





  async findById(id: string) {
    return this.usersService.findById(id);
  }

  async update(id: string, dto: any) {
    return this.usersService.update(id, dto);
  }
}
