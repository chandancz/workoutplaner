import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifysOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async create(data: any) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: any) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password');
  }

  async findByPhone(phone: string, countryCode: string) {
    return this.userModel.findOne({ phone, countryCode });
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const match = await bcrypt.compare(dto.oldPassword, user.password);
    if (!match) throw new BadRequestException('Old password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashed;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new BadRequestException('Email not registered');

    const otp = Math.floor(100000 + Math.random() * 900000); // 6 digit

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 1000 * 60 * 5; // 5 min
    await user.save();

    // TODO: email / SMS
    console.log('OTP:', otp);

    return { message: 'OTP sent to email' };
  }
  async verifyOtp(dto: VerifysOtpDto) {
    const user = await this.userModel.findOne({
      email: dto.email,
      resetOtp: dto.otp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user) throw new BadRequestException('Invalid or expired OTP');

    return { message: 'OTP verified' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new BadRequestException('User not found');

    const hashed = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save();

    return { message: 'Password reset successful' };
  }

  async createUser(phone: string, countryCode: string) {
    const user = this.userModel.create({
      phone,
      countryCode,
      isActive: true,
    });

    return user
  }





}
