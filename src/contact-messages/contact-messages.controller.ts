import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PERMISSIONS } from '../common/constants';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { FilterContactMessagesDto } from './dto/filter-contact-messages.dto';

@ApiTags('contact-messages')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(private readonly service: ContactMessagesService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @ApiOperation({ summary: 'Send a message from the contact form (public)' })
  create(@Body() dto: CreateContactMessageDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MESSAGES_READ)
  @ApiOperation({ summary: 'List contact messages, newest first' })
  findAll(@Query() filter: FilterContactMessagesDto) {
    return this.service.findAll(filter);
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MESSAGES_WRITE)
  @ApiOperation({ summary: 'Mark a message as read' })
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.markRead(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.MESSAGES_DELETE)
  @ApiOperation({ summary: 'Delete a message' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
