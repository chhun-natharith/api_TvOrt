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
import { CreateProvinceDto } from './dto/create-province.dto';
import { FilterProvincesDto } from './dto/filter-provinces.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import { ProvincesService } from './provinces.service';

@ApiTags('provinces')
@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List provinces, optionally by interest' })
  findAll(@Query() filter: FilterProvincesDto) {
    return this.provincesService.findAll(filter);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a province page by slug' })
  findOne(@Param('slug') slug: string) {
    return this.provincesService.findOne(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_WRITE)
  @ApiOperation({ summary: 'Create a province' })
  create(@Body() dto: CreateProvinceDto) {
    return this.provincesService.create(dto);
  }

  @Patch(':slug')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_WRITE)
  @ApiOperation({ summary: 'Update a province' })
  update(@Param('slug') slug: string, @Body() dto: UpdateProvinceDto) {
    return this.provincesService.update(slug, dto);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PROVINCES_DELETE)
  @ApiOperation({
    summary: 'Delete a province (fails while places/plans use it)',
  })
  remove(@Param('slug') slug: string) {
    return this.provincesService.remove(slug);
  }
}
