import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createHash } from 'crypto';
import { readFile } from 'fs/promises';

interface UploadOptions {
  destination: string;
  allowedMimeTypes: string[];
  maxFileSizeInMB: number;
}

export async function generateFileHash(path: string): Promise<string> {
  const buffer = await readFile(path);

  return createHash('sha256').update(buffer).digest('hex');
}
export function createUploadConfig(options: UploadOptions): MulterOptions {
  return {
    storage: diskStorage({
      destination: options.destination,

      filename: (_req, file, callback) => {
        const fileName = `${randomUUID()}${extname(file.originalname)}`;

        callback(null, fileName);
      },
    }),

    limits: {
      fileSize: options.maxFileSizeInMB * 1024 * 1024,
    },

    fileFilter: (_req: Request, file, callback) => {
      if (!options.allowedMimeTypes.includes(file.mimetype)) {
        return callback(new BadRequestException('Invalid file type.'), false);
      }

      callback(null, true);
    },
  };
}
