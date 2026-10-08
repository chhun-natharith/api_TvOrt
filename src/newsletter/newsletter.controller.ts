import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PERMISSIONS } from '../common/constants';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SubscribeDto } from './dto/subscribe.dto';
import { NewsletterService } from './newsletter.service';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe an email to the newsletter (public)' })
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Get('subscribers')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SUBSCRIBERS_READ)
  @ApiOperation({ summary: 'List newsletter subscribers' })
  findAll(@Query() pagination: PaginationDto) {
    return this.newsletterService.findAll(pagination);
  }

  @Delete('subscribers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.SUBSCRIBERS_DELETE)
  @ApiOperation({ summary: 'Remove a subscriber' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsletterService.remove(id);
  }
}
