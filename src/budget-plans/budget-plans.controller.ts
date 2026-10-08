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
import { BudgetPlansService } from './budget-plans.service';
import { CreateBudgetPlanDto } from './dto/create-budget-plan.dto';
import { FilterBudgetPlansDto } from './dto/filter-budget-plans.dto';
import { UpdateBudgetPlanDto } from './dto/update-budget-plan.dto';

@ApiTags('budget-plans')
@Controller('budget-plans')
export class BudgetPlansController {
  constructor(private readonly plansService: BudgetPlansService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List budget plans (cards with totals)' })
  findAll(@Query() filter: FilterBudgetPlansDto) {
    return this.plansService.findAll(filter);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Get a budget plan with its breakdown and itinerary',
  })
  findOne(@Param('slug') slug: string) {
    return this.plansService.findOne(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLANS_WRITE)
  @ApiOperation({ summary: 'Create a budget plan' })
  create(@Body() dto: CreateBudgetPlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':slug')
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLANS_WRITE)
  @ApiOperation({ summary: 'Update a budget plan' })
  update(@Param('slug') slug: string, @Body() dto: UpdateBudgetPlanDto) {
    return this.plansService.update(slug, dto);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions(PERMISSIONS.PLANS_DELETE)
  @ApiOperation({ summary: 'Delete a budget plan' })
  remove(@Param('slug') slug: string) {
    return this.plansService.remove(slug);
  }
}
