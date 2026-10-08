import { Injectable } from '@nestjs/common';
import { Prisma, Province } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const detailInclude = {
  topPlaces: { orderBy: { sortOrder: 'asc' } },
  gettingThere: { orderBy: { sortOrder: 'asc' } },
  plans: { select: { slug: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
} satisfies Prisma.ProvinceInclude;

export type ProvinceWithDetail = Prisma.ProvinceGetPayload<{
  include: typeof detailInclude;
}>;

const displayOrder = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
] satisfies Prisma.ProvinceOrderByWithRelationInput[];

@Injectable()
export class ProvincesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    skip: number,
    take: number,
    where?: Prisma.ProvinceWhereInput,
  ): Promise<Province[]> {
    return this.prisma.province.findMany({
      skip,
      take,
      where,
      orderBy: displayOrder,
    });
  }

  count(where?: Prisma.ProvinceWhereInput): Promise<number> {
    return this.prisma.province.count({ where });
  }

  findBySlug(slug: string): Promise<ProvinceWithDetail | null> {
    return this.prisma.province.findUnique({
      where: { slug },
      include: detailInclude,
    });
  }

  /** Id lookup used by modules that link to a province by slug. */
  findIdsBySlugs(slugs: string[]): Promise<{ id: string; slug: string }[]> {
    return this.prisma.province.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true },
    });
  }

  create(data: Prisma.ProvinceCreateInput): Promise<ProvinceWithDetail> {
    return this.prisma.province.create({ data, include: detailInclude });
  }

  update(
    slug: string,
    data: Prisma.ProvinceUpdateInput,
  ): Promise<ProvinceWithDetail> {
    return this.prisma.province.update({
      where: { slug },
      data,
      include: detailInclude,
    });
  }

  delete(slug: string): Promise<Province> {
    return this.prisma.province.delete({ where: { slug } });
  }

  /** Rows that block deleting a province (their FK is RESTRICT). */
  async countDependents(id: string): Promise<number> {
    const [places, plans] = await Promise.all([
      this.prisma.hiddenPlace.count({ where: { provinceId: id } }),
      this.prisma.budgetPlan.count({ where: { provinceId: id } }),
    ]);
    return places + plans;
  }
}
