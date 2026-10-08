import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CostCategory, Prisma } from '@prisma/client';
import { toJson, toJsonList } from '../common/utils/json.util';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { ProvincesService } from '../provinces/provinces.service';
import { BudgetPlansRepository } from './budget-plans.repository';
import { CreateBudgetPlanDto } from './dto/create-budget-plan.dto';
import { FilterBudgetPlansDto } from './dto/filter-budget-plans.dto';
import { UpdateBudgetPlanDto } from './dto/update-budget-plan.dto';
import {
  BudgetPlanEntity,
  BudgetPlanSummaryEntity,
} from './entities/budget-plan.entity';

@Injectable()
export class BudgetPlansService {
  constructor(
    private readonly plansRepository: BudgetPlansRepository,
    private readonly provincesService: ProvincesService,
  ) {}

  async create(dto: CreateBudgetPlanDto): Promise<BudgetPlanEntity> {
    await this.assertSlugFree(dto.slug);
    const [provinceId] = await this.provincesService.resolveIds([dto.province]);

    const plan = await this.plansRepository.create({
      slug: dto.slug,
      title: toJson(dto.title),
      province: { connect: { id: provinceId } },
      image: dto.image,
      days: dto.days,
      people: dto.people,
      summary: toJson(dto.summary),
      tips: toJsonList(dto.tips),
      sortOrder: dto.sortOrder,
      costs: { create: this.costRows(dto.costs) },
      outline: { create: this.dayRows(dto.outline) },
    });
    return new BudgetPlanEntity(plan);
  }

  async findAll(filter: FilterBudgetPlansDto) {
    const where: Prisma.BudgetPlanWhereInput = {
      province: filter.province ? { slug: filter.province } : undefined,
    };
    const [items, total] = await Promise.all([
      this.plansRepository.findAll(skipOf(filter), filter.limit, where),
      this.plansRepository.count(where),
    ]);
    return toPage(
      items.map((p) => new BudgetPlanSummaryEntity(p)),
      total,
      filter,
    );
  }

  async findOne(slug: string): Promise<BudgetPlanEntity> {
    return new BudgetPlanEntity(await this.mustFindBySlug(slug));
  }

  async update(
    slug: string,
    dto: UpdateBudgetPlanDto,
  ): Promise<BudgetPlanEntity> {
    await this.mustFindBySlug(slug);
    if (dto.slug && dto.slug !== slug) await this.assertSlugFree(dto.slug);
    const provinceId =
      dto.province &&
      (await this.provincesService.resolveIds([dto.province]))[0];

    const plan = await this.plansRepository.update(slug, {
      slug: dto.slug,
      title: dto.title && toJson(dto.title),
      province: provinceId ? { connect: { id: provinceId } } : undefined,
      image: dto.image,
      days: dto.days,
      people: dto.people,
      summary: dto.summary && toJson(dto.summary),
      tips: dto.tips && toJsonList(dto.tips),
      sortOrder: dto.sortOrder,
      costs: dto.costs && {
        deleteMany: {},
        create: this.costRows(dto.costs),
      },
      outline: dto.outline && {
        deleteMany: {},
        create: this.dayRows(dto.outline),
      },
    });
    return new BudgetPlanEntity(plan);
  }

  async remove(slug: string): Promise<void> {
    await this.mustFindBySlug(slug);
    await this.plansRepository.delete(slug);
  }

  private async mustFindBySlug(slug: string) {
    const plan = await this.plansRepository.findBySlug(slug);
    if (!plan) throw new NotFoundException('Budget plan not found');
    return plan;
  }

  private async assertSlugFree(slug: string): Promise<void> {
    if (await this.plansRepository.findBySlug(slug)) {
      throw new ConflictException('Slug already exists');
    }
  }

  /** Flatten `{ transport: [...], stay: [...] }` into rows, keeping the order. */
  private costRows(
    costs: CreateBudgetPlanDto['costs'],
  ): Prisma.BudgetPlanCostCreateWithoutPlanInput[] {
    let order = 0;
    return Object.values(CostCategory).flatMap((category) =>
      costs[category].map((item) => ({
        category,
        label: toJson(item.label),
        amount: item.amount,
        sortOrder: order++,
      })),
    );
  }

  private dayRows(
    outline: CreateBudgetPlanDto['outline'],
  ): Prisma.BudgetPlanDayCreateWithoutPlanInput[] {
    return outline.map((day, i) => ({
      title: toJson(day.title),
      items: toJsonList(day.items),
      sortOrder: i,
    }));
  }
}
