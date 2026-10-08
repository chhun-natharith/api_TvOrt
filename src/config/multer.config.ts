import type { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Max file sizes
export const MAX_USER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Upload directories
export const UPLOAD_DIR = join(process.cwd(), 'uploads');
export const USER_UPLOAD_DIR = join(UPLOAD_DIR, 'users');

// Ensure upload directories exist
export function ensureUploadDirs() {
  [UPLOAD_DIR, USER_UPLOAD_DIR].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });
}

// Generate unique filename
function generateFileName(file: Express.Multer.File, prefix: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = extname(file.originalname);
  return `${prefix}-${timestamp}-${randomString}${ext}`;
}

// File filter
function fileFilter(allowedTypes: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(
          `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        ),
        false,
      );
    }
    callback(null, true);
  };
}

// User profile image multer config
export const userImageMulterConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      ensureUploadDirs();
      callback(null, USER_UPLOAD_DIR);
    },
    filename: (req, file, callback) => {
      const userId = (req as AuthenticatedRequest).user?.sub ?? 'unknown';
      const filename = generateFileName(file, `profile-${userId}`);
      callback(null, filename);
    },
  }),
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
  limits: {
    fileSize: MAX_USER_IMAGE_SIZE,
  },
};
