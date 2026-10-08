import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { ContactMessagesRepository } from './contact-messages.repository';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { FilterContactMessagesDto } from './dto/filter-contact-messages.dto';
import { ContactMessageEntity } from './entities/contact-message.entity';

@Injectable()
export class ContactMessagesService {
  constructor(private readonly repository: ContactMessagesRepository) {}

  /** Public submission: acknowledges receipt without echoing stored data. */
  async create(dto: CreateContactMessageDto): Promise<{ received: true }> {
    await this.repository.create(dto);
    return { received: true };
  }

  async findAll(filter: FilterContactMessagesDto) {
    const where: Prisma.ContactMessageWhereInput =
      filter.unread === undefined
        ? {}
        : { readAt: filter.unread ? null : { not: null } };
    const [items, total] = await Promise.all([
      this.repository.findAll(skipOf(filter), filter.limit, where),
      this.repository.count(where),
    ]);
    return toPage(
      items.map((m) => new ContactMessageEntity(m)),
      total,
      filter,
    );
  }

  async markRead(id: string): Promise<ContactMessageEntity> {
    await this.mustFind(id);
    return new ContactMessageEntity(await this.repository.markRead(id));
  }

  async remove(id: string): Promise<void> {
    await this.mustFind(id);
    await this.repository.delete(id);
  }

  private async mustFind(id: string): Promise<void> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException('Message not found');
    }
  }
}
