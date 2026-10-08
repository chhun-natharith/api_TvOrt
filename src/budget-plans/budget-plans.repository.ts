import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const province = { select: { id: true, slug: true, name: true } } as const;

// Cards only need the amounts, to add up the total.
const totalsInclude = {
  province,
  costs: { select: { amount: true } },
} satisfies Prisma.BudgetPlanInclude;

const detailInclude = {
  province,
  costs: { orderBy: { sortOrder: 'asc' } },
  outline: { orderBy: { sortOrder: 'asc' } },
} satisfies Prisma.BudgetPlanInclude;

export type BudgetPlanWithTotals = Prisma.BudgetPlanGetPayload<{
  include: typeof totalsInclude;
}>;
export type BudgetPlanWithDetail = Prisma.BudgetPlanGetPayload<{
  include: typeof detailInclude;
}>;

@Injectable()
export class BudgetPlansRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    skip: number,
    take: number,
    where?: Prisma.BudgetPlanWhereInput,
  ): Promise<BudgetPlanWithTotals[]> {
    return this.prisma.budgetPlan.findMany({
      skip,
      take,
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: totalsInclude,
    });
  }

  count(where?: Prisma.BudgetPlanWhereInput): Promise<number> {
    return this.prisma.budgetPlan.count({ where });
  }

  findBySlug(slug: string): Promise<BudgetPlanWithDetail | null> {
    return this.prisma.budgetPlan.findUnique({
      where: { slug },
      include: detailInclude,
    });
  }

  create(data: Prisma.BudgetPlanCreateInput): Promise<BudgetPlanWithDetail> {
    return this.prisma.budgetPlan.create({ data, include: detailInclude });
  }

  update(
    slug: string,
    data: Prisma.BudgetPlanUpdateInput,
  ): Promise<BudgetPlanWithDetail> {
    return this.prisma.budgetPlan.update({
      where: { slug },
      data,
      include: detailInclude,
    });
  }

  delete(slug: string): Promise<{ id: string }> {
    return this.prisma.budgetPlan.delete({
      where: { slug },
      select: { id: true },
    });
  }
}
