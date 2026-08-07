import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Media, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { QueryMediaDto } from './dto/query-media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Process and save uploaded single file metadata
   */
  async uploadMedia(
    file: Express.Multer.File,
    uploaderId?: number,
    folder = 'media',
  ) {
    const uploadResult = await this.storageService.uploadFile(file, folder);

    const mediaRecord = await this.prisma.media.create({
      data: {
        filename: file.filename || file.originalname,
        originalName: file.originalname,
        mimeType: uploadResult.mimeType,
        size: uploadResult.size,
        key: uploadResult.key,
        url: uploadResult.url,
        bucket: uploadResult.bucket,
        provider: uploadResult.provider,
        uploaderId,
      },
    });

    this.logger.log(`Media created: ${mediaRecord.id} (${mediaRecord.url})`);
    return mediaRecord;
  }

  /**
   * Process and save multiple uploaded files
   */
  async uploadMultipleMedia(
    files: Express.Multer.File[],
    uploaderId?: number,
    folder = 'media',
  ): Promise<Media[]> {
    const results: Media[] = [];
    for (const file of files) {
      const mediaRecord = await this.uploadMedia(file, uploaderId, folder);
      results.push(mediaRecord);
    }
    return results;
  }

  /**
   * Get media metadata by ID
   */
  async getMediaById(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: String(id) },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return media;
  }

  /**
   * List media records with pagination
   */
  async findAll(query: QueryMediaDto) {
    const { page = 1, limit = 20, mimeType, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.MediaWhereInput = {};
    if (mimeType) {
      where.mimeType = { contains: mimeType, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete media file from object storage and database
   */
  async remove(id: string) {
    const media = await this.getMediaById(id);

    // 1. Delete object from storage
    await this.storageService.deleteFile(media.key);

    // 2. Delete database record
    await this.prisma.media.delete({
      where: { id },
    });

    return { message: `Media ${id} successfully deleted` };
  }
}
