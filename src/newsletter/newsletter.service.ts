import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { SubscribeDto } from './dto/subscribe.dto';
import { NewsletterSubscriberEntity } from './entities/newsletter-subscriber.entity';
import { NewsletterRepository } from './newsletter.repository';

@Injectable()
export class NewsletterService {
  constructor(private readonly newsletterRepository: NewsletterRepository) {}

  /**
   * Always reports success for a valid email, whether or not it was already
   * subscribed, so the public form can't be used to probe who is on the list.
   */
  async subscribe(dto: SubscribeDto): Promise<{ subscribed: true }> {
    await this.newsletterRepository.upsertByEmail(dto.email);
    return { subscribed: true };
  }

  async findAll(pagination: PaginationDto) {
    const [items, total] = await Promise.all([
      this.newsletterRepository.findAll(skipOf(pagination), pagination.limit),
      this.newsletterRepository.count(),
    ]);
    return toPage(
      items.map((s) => new NewsletterSubscriberEntity(s)),
      total,
      pagination,
    );
  }

  async remove(id: string): Promise<void> {
    if (!(await this.newsletterRepository.findById(id))) {
      throw new NotFoundException('Subscriber not found');
    }
    await this.newsletterRepository.delete(id);
  }
}
