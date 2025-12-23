import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir);
    }
  }

  createWriteStream(filename: string) {
    const filePath = path.join(this.uploadDir, filename);
    return fs.createWriteStream(filePath);
  }

  createReadStream(filename: string) {
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    return fs.createReadStream(filePath);
  }
}
