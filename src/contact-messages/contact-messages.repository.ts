import { Injectable } from '@nestjs/common';
import { ContactMessage, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactMessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ContactMessageCreateInput): Promise<ContactMessage> {
    return this.prisma.contactMessage.create({ data });
  }

  findAll(
    skip: number,
    take: number,
    where?: Prisma.ContactMessageWhereInput,
  ): Promise<ContactMessage[]> {
    return this.prisma.contactMessage.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  count(where?: Prisma.ContactMessageWhereInput): Promise<number> {
    return this.prisma.contactMessage.count({ where });
  }

  findById(id: string): Promise<ContactMessage | null> {
    return this.prisma.contactMessage.findUnique({ where: { id } });
  }

  markRead(id: string): Promise<ContactMessage> {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  delete(id: string): Promise<ContactMessage> {
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
