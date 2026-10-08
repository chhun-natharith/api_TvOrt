import { Injectable } from '@nestjs/common';
import { NewsletterSubscriber } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotent: subscribing twice is not an error. */
  upsertByEmail(email: string): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }

  findAll(skip: number, take: number): Promise<NewsletterSubscriber[]> {
    return this.prisma.newsletterSubscriber.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(): Promise<number> {
    return this.prisma.newsletterSubscriber.count();
  }

  findById(id: string): Promise<NewsletterSubscriber | null> {
    return this.prisma.newsletterSubscriber.findUnique({ where: { id } });
  }

  delete(id: string): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }
}
