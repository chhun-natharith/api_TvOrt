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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../common/constants';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { FilterProvincesDto } from '../provinces/dto/filter-provinces.dto';
import { CreateUpcomingProvinceDto } from './dto/create-upcoming-province.dto';
import { UpdateUpcomingProvinceDto } from './dto/update-upcoming-province.dto';
import { UpcomingProvincesService } from './upcoming-provinces.service';

@ApiTags('upcoming-provinces')
@Controller('upcoming-provinces')
export class UpcomingProvincesController {
  constructor(private readonly service: UpcomingProvincesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List "coming soon" provinces' })
  findAll(@Query() filter: FilterProvincesDto) {
    return this.service.findAll(filter);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_WRITE)
  @ApiOperation({ summary: 'Add a "coming soon" province' })
  create(@Body() dto: CreateUpcomingProvinceDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_WRITE)
  @ApiOperation({ summary: 'Update a "coming soon" province' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUpcomingProvinceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_DELETE)
  @ApiOperation({ summary: 'Remove a "coming soon" province' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
