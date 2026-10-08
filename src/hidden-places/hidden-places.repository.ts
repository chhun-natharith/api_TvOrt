import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const withProvince = {
  province: { select: { id: true, slug: true, name: true } },
} satisfies Prisma.HiddenPlaceInclude;

export type HiddenPlaceWithProvince = Prisma.HiddenPlaceGetPayload<{
  include: typeof withProvince;
}>;

const displayOrder = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
] satisfies Prisma.HiddenPlaceOrderByWithRelationInput[];

@Injectable()
export class HiddenPlacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    skip: number,
    take: number,
    where?: Prisma.HiddenPlaceWhereInput,
  ): Promise<HiddenPlaceWithProvince[]> {
    return this.prisma.hiddenPlace.findMany({
      skip,
      take,
      where,
      orderBy: displayOrder,
      include: withProvince,
    });
  }

  count(where?: Prisma.HiddenPlaceWhereInput): Promise<number> {
    return this.prisma.hiddenPlace.count({ where });
  }

  findBySlug(slug: string): Promise<HiddenPlaceWithProvince | null> {
    return this.prisma.hiddenPlace.findUnique({
      where: { slug },
      include: withProvince,
    });
  }

  /** Other places in the same province. */
  findRelated(
    placeId: string,
    provinceId: string,
    take: number,
  ): Promise<HiddenPlaceWithProvince[]> {
    return this.prisma.hiddenPlace.findMany({
      where: { id: { not: placeId }, provinceId },
      orderBy: displayOrder,
      take,
      include: withProvince,
    });
  }

  create(
    data: Prisma.HiddenPlaceCreateInput,
  ): Promise<HiddenPlaceWithProvince> {
    return this.prisma.hiddenPlace.create({ data, include: withProvince });
  }

  update(
    slug: string,
    data: Prisma.HiddenPlaceUpdateInput,
  ): Promise<HiddenPlaceWithProvince> {
    return this.prisma.hiddenPlace.update({
      where: { slug },
      data,
      include: withProvince,
    });
  }

  delete(slug: string): Promise<HiddenPlaceWithProvince> {
    return this.prisma.hiddenPlace.delete({
      where: { slug },
      include: withProvince,
    });
  }
}
