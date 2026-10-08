import type { NewsletterSubscriber } from '@prisma/client';

export class NewsletterSubscriberEntity {
  id: string;
  email: string;
  createdAt: Date;

  constructor(row: NewsletterSubscriber) {
    this.id = row.id;
    this.email = row.email;
    this.createdAt = row.createdAt;
  }
}
