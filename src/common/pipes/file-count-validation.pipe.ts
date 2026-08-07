import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileCountValidationPipe implements PipeTransform {
  constructor(private readonly maxCount: number = 10) {}

  transform(files: Express.Multer.File[]) {
    if (Array.isArray(files) && files.length > this.maxCount) {
      throw new BadRequestException(
        `Too many files uploaded. Maximum allowed is ${this.maxCount} files per request, but received ${files.length}.`,
      );
    }
    return files;
  }
}
