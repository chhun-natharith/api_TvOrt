import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { toJson } from '../common/utils/json.util';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { FilterProvincesDto } from '../provinces/dto/filter-provinces.dto';
import { CreateUpcomingProvinceDto } from './dto/create-upcoming-province.dto';
import { UpdateUpcomingProvinceDto } from './dto/update-upcoming-province.dto';
import { UpcomingProvinceEntity } from './entities/upcoming-province.entity';
import { UpcomingProvincesRepository } from './upcoming-provinces.repository';

@Injectable()
export class UpcomingProvincesService {
  constructor(private readonly repository: UpcomingProvincesRepository) {}

  async create(dto: CreateUpcomingProvinceDto) {
    const row = await this.repository.create({
      name: toJson(dto.name),
      image: dto.image,
      interests: dto.interests,
      sortOrder: dto.sortOrder,
    });
    return new UpcomingProvinceEntity(row);
  }

  async findAll(filter: FilterProvincesDto) {
    const where: Prisma.UpcomingProvinceWhereInput = filter.interest
      ? { interests: { has: filter.interest } }
      : {};
    const [items, total] = await Promise.all([
      this.repository.findAll(skipOf(filter), filter.limit, where),
      this.repository.count(where),
    ]);
    return toPage(
      items.map((r) => new UpcomingProvinceEntity(r)),
      total,
      filter,
    );
  }

  async update(id: string, dto: UpdateUpcomingProvinceDto) {
    await this.mustFind(id);
    const row = await this.repository.update(id, {
      name: dto.name && toJson(dto.name),
      image: dto.image,
      interests: dto.interests,
      sortOrder: dto.sortOrder,
    });
    return new UpcomingProvinceEntity(row);
  }

  async remove(id: string): Promise<void> {
    await this.mustFind(id);
    await this.repository.delete(id);
  }

  private async mustFind(id: string): Promise<void> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException('Upcoming province not found');
    }
  }
}
