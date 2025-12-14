import { Module } from '@nestjs/common';
import { RedisOtpService } from './redis-otp.service';


@Module({
  providers: [RedisOtpService],
  exports: [RedisOtpService],
})
export class RedisOtpModule {}
