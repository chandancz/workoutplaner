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
}
