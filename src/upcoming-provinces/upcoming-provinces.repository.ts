import { Injectable } from '@nestjs/common';
import { Prisma, UpcomingProvince } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpcomingProvincesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(
    skip: number,
    take: number,
    where?: Prisma.UpcomingProvinceWhereInput,
  ): Promise<UpcomingProvince[]> {
    return this.prisma.upcomingProvince.findMany({
      skip,
      take,
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  count(where?: Prisma.UpcomingProvinceWhereInput): Promise<number> {
    return this.prisma.upcomingProvince.count({ where });
  }

  findById(id: string): Promise<UpcomingProvince | null> {
    return this.prisma.upcomingProvince.findUnique({ where: { id } });
  }

  create(data: Prisma.UpcomingProvinceCreateInput): Promise<UpcomingProvince> {
    return this.prisma.upcomingProvince.create({ data });
  }

  update(
    id: string,
    data: Prisma.UpcomingProvinceUpdateInput,
  ): Promise<UpcomingProvince> {
    return this.prisma.upcomingProvince.update({ where: { id }, data });
  }

  delete(id: string): Promise<UpcomingProvince> {
    return this.prisma.upcomingProvince.delete({ where: { id } });
  }
}
