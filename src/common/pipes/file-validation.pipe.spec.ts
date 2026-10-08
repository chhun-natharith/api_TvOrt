import { Readable } from 'stream';
import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from './file-validation.pipe';

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    pipe = new FileValidationPipe({
      maxSizeBytes: 1024 * 1024, // 1MB
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    });
  });

  const createMockFile = (
    originalname: string,
    mimetype: string,
    size: number,
    buffer?: Buffer,
  ): Express.Multer.File => ({
    fieldname: 'file',
    originalname,
    encoding: '7bit',
    mimetype,
    size,
    buffer: buffer || Buffer.from([0xff, 0xd8, 0xff]), // JPEG header
    destination: '',
    filename: originalname,
    path: '',
    stream: new Readable(),
  });

  it('should pass valid file', () => {
    const file = createMockFile('test.jpg', 'image/jpeg', 500 * 1024);
    expect(pipe.transform(file)).toEqual(file);
  });

  it('should throw BadRequestException if file exceeds size limit', () => {
    const file = createMockFile('large.jpg', 'image/jpeg', 2 * 1024 * 1024);
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if MIME type is disallowed', () => {
    const file = createMockFile('test.txt', 'text/plain', 100);
    expect(() => pipe.transform(file)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException if file magic bytes do not match MIME type', () => {
    const pipeWithMagic = new FileValidationPipe({
      allowedMimeTypes: ['image/png'],
    });
    // Buffer has JPEG header, but mimetype is PNG
    const spoofedFile = createMockFile(
      'fake.png',
      'image/png',
      1000,
      Buffer.from([0xff, 0xd8, 0xff]),
    );
    expect(() => pipeWithMagic.transform(spoofedFile)).toThrow(
      BadRequestException,
    );
  });
});
