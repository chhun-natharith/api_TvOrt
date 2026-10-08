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
import { CreateFoodDto } from './dto/create-food.dto';
import { FilterFoodsDto } from './dto/filter-foods.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { FoodsService } from './foods.service';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List foods, optionally by province and type' })
  findAll(@Query() filter: FilterFoodsDto) {
    return this.foodsService.findAll(filter);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a food page by slug, with related foods' })
  findOne(@Param('slug') slug: string) {
    return this.foodsService.findOne(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.FOODS_WRITE)
  @ApiOperation({ summary: 'Create a food' })
  create(@Body() dto: CreateFoodDto) {
    return this.foodsService.create(dto);
  }

  @Patch(':slug')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.FOODS_WRITE)
  @ApiOperation({ summary: 'Update a food' })
  update(@Param('slug') slug: string, @Body() dto: UpdateFoodDto) {
    return this.foodsService.update(slug, dto);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.FOODS_DELETE)
  @ApiOperation({ summary: 'Delete a food' })
  remove(@Param('slug') slug: string) {
    return this.foodsService.remove(slug);
  }
}
