import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

interface ChangePhoneOtpPayload {
  otp: string;
  userId: string;
  phone: string;
  countryCode: string;
  createdAt: number;
}


@Injectable()
export class RedisOtpService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) { }

  private buildKey(phone: string, countryCode: string): string {
    return `otp:${countryCode}${phone}`;
  }

  // 🔐 Store OTP (5 minutes)
  async storeOtp(
    phone: string,
    countryCode: string,
    otp: string,
  ): Promise<void> {
    const key = this.buildKey(phone, countryCode);
    await this.cache.set(key, otp, { ttl: 300 } as any);
    console.log('OTP stored:', otp);
  }

  // ✅ Verify OTP
  async verifyOtp(phone: string, countryCode: string, otp: string,): Promise<{ phone: string; countryCode: string }> {
    const key = this.buildKey(phone, countryCode);

    const storedOtp = await this.cache.get<string>(key);
    if (!storedOtp) {
      throw new BadRequestException('OTP expired or invalid');
    }

    if (storedOtp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.cache.del(key);

    return { phone, countryCode };
  }


  async clearOtp(phone: string, countryCode: string): Promise<void> {
    const key = this.buildKey(phone, countryCode);
    await this.cache.del(key);
  }

  async getOtp(phone: string, countryCode: string) {
    const key = this.buildKey(phone, countryCode);
    const otp = await this.cache.get<string>(key);
    console.log('Fetched OTP:', otp);
    return otp;
  }

  private buildChangePhoneKey(
    userId: string,
    phone: string,
    countryCode: string,
  ): string {
    return `change-phone-otp:${userId}:${countryCode}:${phone}`;
  }

  async storeOtpPhone(
    userId: string,
    phone: string,
    countryCode: string,
    otp: string,
  ): Promise<void> {
    const key = this.buildChangePhoneKey(userId, phone, countryCode);
    const payload: ChangePhoneOtpPayload = {
      otp,
      userId,
      phone,
      countryCode,
      createdAt: Date.now(),
    };

    await this.cache.set(key, payload, { ttl: 300 } as any);
    console.log('Change phone OTP stored:', payload);
  }

  async verifyOtpPhone(
    userId: string,
    phone: string,
    countryCode: string,
    otp: string,
  ): Promise<{ phone: string; countryCode: string }> {
    const key = this.buildChangePhoneKey(userId, phone, countryCode);
    console.log(key,'====>key')
    const stored = await this.cache.get<ChangePhoneOtpPayload>(key);
    if (!stored) {
      throw new BadRequestException('OTP expired or invalid');
    }

    if (stored.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (stored.userId !== userId) {
      throw new BadRequestException('OTP does not belong to this user');
    }

    await this.cache.del(key);

    return {
      phone: stored.phone,
      countryCode: stored.countryCode,
    };
  }


}
