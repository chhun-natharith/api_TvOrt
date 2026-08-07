import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  provider: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private readonly provider: string;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('storage.provider', 'S3');
    this.bucket = this.configService.get<string>(
      'storage.bucket',
      'inventory-media',
    );
    this.region = this.configService.get<string>('storage.region', 'us-east-1');
    this.publicUrl = this.configService.get<string>('storage.publicUrl');
  }

  onModuleInit() {
    const accessKeyId = this.configService.get<string>('storage.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      'storage.secretAccessKey',
    );
    const endpoint = this.configService.get<string>('storage.endpoint');
    const forcePathStyle = this.configService.get<boolean>(
      'storage.forcePathStyle',
      false,
    );

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region: this.region,
        endpoint: endpoint || undefined,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        forcePathStyle:
          forcePathStyle || this.provider.toUpperCase() === 'MINIO',
      });
      this.logger.log(
        `Storage initialized with provider: ${this.provider} (Bucket: ${this.bucket})`,
      );
    } else {
      this.logger.warn(
        `Storage access keys not provided. Falling back to local disk storage.`,
      );
    }
  }

  /**
   * Upload a file buffer to S3/R2/MinIO or Local Storage
   */
  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 10);
    const ext = extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();

    const key = `${folder}/${sanitizedName}-${timestamp}-${randomHex}${ext}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer || file.stream,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key);

      return {
        key,
        url,
        bucket: this.bucket,
        provider: this.provider,
        mimeType: file.mimetype,
        size: file.size,
      };
    } else {
      // Local fallback storage
      const localDir = join(process.cwd(), 'uploads', folder);
      if (!existsSync(localDir)) {
        mkdirSync(localDir, { recursive: true });
      }
      const filePath = join(
        localDir,
        `${sanitizedName}-${timestamp}-${randomHex}${ext}`,
      );
      writeFileSync(filePath, file.buffer);

      const relativeUrl = `/uploads/${folder}/${sanitizedName}-${timestamp}-${randomHex}${ext}`;
      return {
        key,
        url: relativeUrl,
        bucket: 'local',
        provider: 'LOCAL',
        mimeType: file.mimetype,
        size: file.size,
      };
    }
  }

  /**
   * Delete object from storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.s3Client) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        });
        await this.s3Client.send(command);
      } catch (error) {
        this.logger.error(`Failed to delete object ${key} from storage`, error);
      }
    } else {
      const localPath = join(process.cwd(), key);
      if (existsSync(localPath)) {
        try {
          unlinkSync(localPath);
        } catch (e) {
          this.logger.error(`Failed to delete local file ${localPath}`, e);
        }
      }
    }
  }

  private getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    const endpoint = this.configService.get<string>('storage.endpoint');
    if (endpoint) {
      return `${endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
