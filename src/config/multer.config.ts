import { memoryStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileValidationOptions } from '../common/pipes/file-validation.pipe';

export const MAX_USER_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** Content checks for avatars, applied with `FileValidationPipe`. */
export const userImageValidation: FileValidationOptions = {
  maxSizeBytes: MAX_USER_IMAGE_SIZE,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Keeps the upload in memory so StorageService can send it to object storage
 * (or write it under ./uploads locally). The size limit stops oversized
 * uploads while they stream, before they are buffered in full.
 */
export const userImageMulterConfig: MulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_USER_IMAGE_SIZE, files: 1 },
};
