import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

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
}
