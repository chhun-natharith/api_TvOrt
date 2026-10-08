import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { CreateHiddenPlaceDto } from './dto/create-hidden-place.dto';
import { FilterHiddenPlacesDto } from './dto/filter-hidden-places.dto';
import { UpdateHiddenPlaceDto } from './dto/update-hidden-place.dto';
import { HiddenPlacesService } from './hidden-places.service';

@ApiTags('hidden-places')
@Controller('hidden-places')
export class HiddenPlacesController {
  constructor(private readonly placesService: HiddenPlacesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List hidden places by province and category' })
  findAll(@Query() filter: FilterHiddenPlacesDto) {
    return this.placesService.findAll(filter);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a hidden place by slug, with related places' })
  findOne(@Param('slug') slug: string) {
    return this.placesService.findOne(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLACES_WRITE)
  @ApiOperation({ summary: 'Create a hidden place' })
  create(@Body() dto: CreateHiddenPlaceDto) {
    return this.placesService.create(dto);
  }

  @Patch(':slug')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLACES_WRITE)
  @ApiOperation({ summary: 'Update a hidden place' })
  update(@Param('slug') slug: string, @Body() dto: UpdateHiddenPlaceDto) {
    return this.placesService.update(slug, dto);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLACES_DELETE)
  @ApiOperation({ summary: 'Delete a hidden place' })
  remove(@Param('slug') slug: string) {
    return this.placesService.remove(slug);
  }
}
