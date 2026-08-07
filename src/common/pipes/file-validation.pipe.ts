import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxSizeBytes?: number;
  required?: boolean;
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Magic Bytes mapping for file extension/MIME verification
 */
const MAGIC_NUMBERS: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
};

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File | Express.Multer.File[]) {
    const isRequired = this.options.required ?? true;

    if (!file || (Array.isArray(file) && file.length === 0)) {
      if (isRequired) {
        throw new BadRequestException('File is required for upload');
      }
      return file;
    }

    const files = Array.isArray(file) ? file : [file];
    const allowedMimeTypes =
      this.options.allowedMimeTypes ?? DEFAULT_ALLOWED_TYPES;
    const maxSizeBytes = this.options.maxSizeBytes ?? DEFAULT_MAX_SIZE;

    for (const f of files) {
      // 1. File size check
      if (f.size > maxSizeBytes) {
        const maxSizeMb = (maxSizeBytes / (1024 * 1024)).toFixed(1);
        throw new BadRequestException(
          `File "${f.originalname}" size (${(f.size / (1024 * 1024)).toFixed(
            2,
          )}MB) exceeds maximum allowed limit of ${maxSizeMb}MB.`,
        );
      }

      // 2. MIME type check
      if (!allowedMimeTypes.includes(f.mimetype)) {
        throw new BadRequestException(
          `File "${f.originalname}" has disallowed MIME type: ${f.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`,
        );
      }

      // 3. Extension check
      if (this.options.allowedExtensions) {
        const ext = f.originalname.split('.').pop()?.toLowerCase();
        if (!ext || !this.options.allowedExtensions.includes(ext)) {
          throw new BadRequestException(
            `File "${f.originalname}" extension .${ext} is not allowed. Allowed extensions: ${this.options.allowedExtensions.join(', ')}`,
          );
        }
      }

      // 4. Magic Bytes signature check (if buffer is present)
      if (f.buffer) {
        const magic = MAGIC_NUMBERS[f.mimetype];
        if (magic) {
          if (f.buffer.length < magic.length) {
            throw new BadRequestException(
              `File "${f.originalname}" is corrupted or too short for MIME type ${f.mimetype}.`,
            );
          }
          const matches = magic.every((byte, i) => f.buffer[i] === byte);
          if (!matches) {
            throw new BadRequestException(
              `File "${f.originalname}" failed magic byte verification. File contents do not match MIME type ${f.mimetype}.`,
            );
          }
        }
      }
    }

    return file;
  }
}
