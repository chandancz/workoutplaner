import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import type { Request, Response } from 'express';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import mime from 'mime-types';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload large file using stream & chunks' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  upload(@Req() req: Request, @Res() res: Response) {
    const busboy = Busboy({ headers: req.headers });

    let fileName = '';
    let totalSize = 0;

    busboy.on('file', (_, file, info) => {
      fileName = info.filename;

      const writeStream =
        this.fileUploadService.createWriteStream(fileName);

      file.on('data', (chunk) => {
        totalSize += chunk.length;
      });

      file.pipe(writeStream);
    });

    busboy.on('finish', () => {
      res.status(HttpStatus.CREATED).json({
        statusCode: 201,
        success: true,
        message: 'File uploaded successfully using stream',
        data: {
          fileName,
          size: totalSize,
        },
      });
    });

    req.pipe(busboy);
  }

  // 🔽 DOWNLOAD (READ STREAM)
  @Get('download/:filename')
  @ApiOperation({ summary: 'Download file as stream' })
  @ApiResponse({ status: 200, description: 'File streamed successfully' })
  download(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const stream =
      this.fileUploadService.createReadStream(filename);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res);
  }


   @Get('video/:filename')
  @ApiOperation({ summary: 'Stream video in chunks (YouTube style)' })
  @ApiResponse({ status: 206, description: 'Partial Content (video chunk)' })
  streamVideo(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const videoPath = path.join(process.cwd(), 'uploads', filename);

    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      // Browser MUST send range
      res.status(416).send('Range header required');
      return;
    }

    // ✅ Parse range
    const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB (YouTube sends small chunks)
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;
    const contentType =
      mime.lookup(videoPath) || 'video/mp4';

    // ✅ Required headers for streaming
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': contentType,
    });

    // ✅ Stream only requested chunk
    const videoStream = fs.createReadStream(videoPath, {
      start,
      end,
    });

    videoStream.pipe(res);
  }
}
