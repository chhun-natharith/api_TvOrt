import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import type { Media, Role, User } from '@prisma/client';

export type UserWithRole = User & {
  role: Pick<Role, 'name'> | null;
  profileImage: Pick<Media, 'url'> | null;
};

/**
 * Public shape of a user. The password hash is never copied in, so it cannot
 * leak from any endpoint regardless of serializer setup.
 */
export class UserEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ required: false, nullable: true })
  role: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Avatar URL: absolute for S3/R2/MinIO, "/uploads/…" for local storage',
  })
  profileImage: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(user: UserWithRole) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.status = user.status;
    this.role = user.role?.name ?? null;
    this.profileImage = user.profileImage?.url ?? null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
