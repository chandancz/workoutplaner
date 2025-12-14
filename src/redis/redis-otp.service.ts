import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RedisOtpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) { }

  async storeOtp(phone: string, countryCode: string, otp: string) {
    const hashedOtp = await bcrypt.hash(otp, 10);
    const key = this.buildKey(phone, countryCode);

    // Store
    await this.cache.set(key, hashedOtp);

    // Retrieve
    const storedOtp = await this.cache.get(key);

    console.log("Stored OTP hash:", hashedOtp);
    console.log("Retrieved OTP hash:", storedOtp);

    return storedOtp;
  }

  async getOtp(phone: string, countryCode: string) {
    const key = this.buildKey(phone, countryCode);
    const otp = await this.cache.get<string>(key);
    console.log("Fetched OTP hash:", otp);
    return otp;
  }

  async clearOtp(phone: string, countryCode: string) {
    const key = this.buildKey(phone, countryCode);
    await this.cache.del(key);
  }

  private buildKey(phone: string, countryCode: string): string {
    return `otp:${countryCode}${phone}`;
  }
}
