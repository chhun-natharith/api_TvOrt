-- Profile images move from a URL string on users to a media row, so they go
-- through StorageService (S3/R2/MinIO, or local disk) like every other upload.

-- AlterTable: add the link first so existing avatars can be moved over
ALTER TABLE "users" ADD COLUMN "profileImageId" TEXT;

-- Copy existing local avatars ("/uploads/<key>") into media. The file stays
-- where it is: local storage keeps "<key>" under ./uploads. Size is unknown.
INSERT INTO "media" ("id", "filename", "originalName", "mimeType", "size", "key", "url", "bucket", "provider", "uploaderId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  regexp_replace(u."profileImage", '^.*/', ''),
  regexp_replace(u."profileImage", '^.*/', ''),
  CASE lower(regexp_replace(u."profileImage", '^.*\.', ''))
    WHEN 'png' THEN 'image/png'
    WHEN 'webp' THEN 'image/webp'
    WHEN 'gif' THEN 'image/gif'
    ELSE 'image/jpeg'
  END,
  0,
  substring(u."profileImage" from 10),
  u."profileImage",
  'local',
  'LOCAL',
  u."id",
  NOW(),
  NOW()
FROM "users" u
WHERE u."profileImage" LIKE '/uploads/%'
ON CONFLICT ("key") DO NOTHING;

UPDATE "users" u
SET "profileImageId" = m."id"
FROM "media" m
WHERE u."profileImage" LIKE '/uploads/%'
  AND m."key" = substring(u."profileImage" from 10);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profileImage";

-- CreateIndex
CREATE UNIQUE INDEX "users_profileImageId_key" ON "users"("profileImageId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
