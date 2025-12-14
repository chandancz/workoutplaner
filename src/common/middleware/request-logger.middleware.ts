import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl;
    const body = { ...req.body };

    if (body.password) delete body.password;
    if (body.otp) delete body.otp;

    const log = {
      method,
      url,
      body,
      timestamp: new Date().toISOString(),
    };

    // console.log('📌 Request Log:', log);

    const logDir = 'logs';
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    const fileName = path.join(
      logDir,
      `log_${new Date().toISOString().split('T')[0]}.txt`,
    );

    fs.appendFileSync(fileName, JSON.stringify(log) + '\n');

    next();
  }
}
