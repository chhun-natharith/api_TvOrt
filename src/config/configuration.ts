export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '8200', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'S3', // S3 | R2 | MINIO | LOCAL
    bucket: process.env.STORAGE_BUCKET ?? 'inventory-media',
    region: process.env.STORAGE_REGION ?? 'us-east-1',
    endpoint: process.env.STORAGE_ENDPOINT, // e.g. http://localhost:9000 for MinIO or R2 endpoint URL
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '',
    publicUrl: process.env.STORAGE_PUBLIC_URL, // Optional CDN / public domain prefix
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
  },
});
