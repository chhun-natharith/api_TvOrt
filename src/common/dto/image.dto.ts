import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * An image reference: an Unsplash photo id ("photo-1663075039775-c4c05356b8fe"),
 * an absolute URL, or an uploaded file's path. The frontend's image loader decides
 * how to render it; the API just stores the string.
 */
export const IsImageRef = () =>
  applyDecorators(
    ApiProperty({ example: 'photo-1663075039775-c4c05356b8fe' }),
    IsString(),
    IsNotEmpty(),
    MaxLength(500),
  );
