import type { ContactMessage } from '@prisma/client';

export class ContactMessageEntity {
  id: string;
  name: string;
  email: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;

  constructor(row: ContactMessage) {
    this.id = row.id;
    this.name = row.name;
    this.email = row.email;
    this.message = row.message;
    this.readAt = row.readAt;
    this.createdAt = row.createdAt;
  }
}
