import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { MediaService } from './media.service';
import { QueryMediaDto } from './dto/query-media.dto';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { FileCountValidationPipe } from '../common/pipes/file-count-validation.pipe';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Single file upload endpoint (multipart/form-data)
   */
  @Post('upload')
  @RequirePermissions(PERMISSIONS.MEDIA_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload single file to object storage & save metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (max 10MB; JPEG, PNG, WEBP, GIF, PDF)',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile(
      new FileValidationPipe({
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'application/pdf',
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    const uploaderId = req.user?.sub;
    return this.mediaService.uploadMedia(file, uploaderId);
  }

  /**
   * Multiple file batch upload endpoint (multipart/form-data)
   */
  @Post('upload-multiple')
  @RequirePermissions(PERMISSIONS.MEDIA_WRITE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Upload multiple files (up to 10) to object storage & save metadata',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array of files to upload (max 10 files, 10MB each)',
        },
      },
      required: ['files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles(
      new FileCountValidationPipe(10),
      new FileValidationPipe({
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'application/pdf',
        ],
      }),
    )
    files: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ) {
    const uploaderId = req.user?.sub;
    return this.mediaService.uploadMultipleMedia(files, uploaderId);
  }

  /**
   * List all media records with pagination and filters
   */
  @Get()
  @RequirePermissions(PERMISSIONS.MEDIA_READ)
  @ApiOperation({ summary: 'List media items with pagination' })
  async findAll(@Query() query: QueryMediaDto) {
    return this.mediaService.findAll(query);
  }

  /**
   * Get media item metadata by ID
   */
  @Get(':id')
  @RequirePermissions(PERMISSIONS.MEDIA_READ)
  @ApiOperation({ summary: 'Get media metadata by ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }

  /**
   * Delete media file & metadata by ID
   */
  @Delete(':id')
  @RequirePermissions(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({ summary: 'Delete media file from storage and database' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
