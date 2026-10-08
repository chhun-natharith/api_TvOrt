import { Module } from '@nestjs/common';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesRepository } from './contact-messages.repository';
import { ContactMessagesService } from './contact-messages.service';

@Module({
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService, ContactMessagesRepository],
})
export class ContactMessagesModule {}
