import { Injectable } from '@nestjs/common';
import { Food, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const detailInclude = {
  venues: { orderBy: { sortOrder: 'asc' } },
  provinces: {
    select: { id: true, slug: true, name: true },
    orderBy: { sortOrder: 'asc' },
  },
} satisfies Prisma.FoodInclude;

export type FoodWithDetail = Prisma.FoodGetPayload<{
  include: typeof detailInclude;
}>;

const displayOrder = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
] satisfies Prisma.FoodOrderByWithRelationInput[];

@Injectable()
export class FoodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    skip: number,
    take: number,
    where?: Prisma.FoodWhereInput,
  ): Promise<Food[]> {
    return this.prisma.food.findMany({
      skip,
      take,
      where,
      orderBy: displayOrder,
    });
  }

  count(where?: Prisma.FoodWhereInput): Promise<number> {
    return this.prisma.food.count({ where });
  }

  findBySlug(slug: string): Promise<FoodWithDetail | null> {
    return this.prisma.food.findUnique({
      where: { slug },
      include: detailInclude,
    });
  }

  /** Other foods sold in any of the given provinces. */
  findRelated(
    foodId: string,
    provinceIds: string[],
    take: number,
  ): Promise<Food[]> {
    return this.prisma.food.findMany({
      where: {
        id: { not: foodId },
        provinces: { some: { id: { in: provinceIds } } },
      },
      orderBy: displayOrder,
      take,
    });
  }

  create(data: Prisma.FoodCreateInput): Promise<FoodWithDetail> {
    return this.prisma.food.create({ data, include: detailInclude });
  }

  update(slug: string, data: Prisma.FoodUpdateInput): Promise<FoodWithDetail> {
    return this.prisma.food.update({
      where: { slug },
      data,
      include: detailInclude,
    });
  }

  delete(slug: string): Promise<Food> {
    return this.prisma.food.delete({ where: { slug } });
  }
}
