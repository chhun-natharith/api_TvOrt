import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toJson } from '../common/utils/json.util';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { CreateProvinceDto } from './dto/create-province.dto';
import { FilterProvincesDto } from './dto/filter-provinces.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';
import {
  ProvinceEntity,
  ProvinceSummaryEntity,
} from './entities/province.entity';
import { ProvincesRepository } from './provinces.repository';

@Injectable()
export class ProvincesService {
  constructor(private readonly provincesRepository: ProvincesRepository) {}

  async create(dto: CreateProvinceDto): Promise<ProvinceEntity> {
    await this.assertSlugFree(dto.slug);
    const province = await this.provincesRepository.create({
      slug: dto.slug,
      name: toJson(dto.name),
      tagline: toJson(dto.tagline),
      image: dto.image,
      interests: dto.interests,
      whyGo: toJson(dto.whyGo),
      bestSeasonMonths: toJson(dto.bestSeason.months),
      bestSeasonDetail: toJson(dto.bestSeason.detail),
      goodToKnow: dto.goodToKnow ? toJson(dto.goodToKnow) : undefined,
      budgetStay: dto.sampleBudget.stay,
      budgetFood: dto.sampleBudget.food,
      budgetTransport: dto.sampleBudget.transport,
      budgetActivities: dto.sampleBudget.activities,
      budgetNote: toJson(dto.sampleBudget.note),
      sortOrder: dto.sortOrder,
      topPlaces: { create: this.topPlaceRows(dto.topPlaces) },
      gettingThere: { create: this.transportRows(dto.gettingThere) },
    });
    return new ProvinceEntity(province);
  }

  async findAll(filter: FilterProvincesDto) {
    const where: Prisma.ProvinceWhereInput = filter.interest
      ? { interests: { has: filter.interest } }
      : {};
    const [items, total] = await Promise.all([
      this.provincesRepository.findAll(skipOf(filter), filter.limit, where),
      this.provincesRepository.count(where),
    ]);
    return toPage(
      items.map((p) => new ProvinceSummaryEntity(p)),
      total,
      filter,
    );
  }

  async findOne(slug: string): Promise<ProvinceEntity> {
    const province = await this.provincesRepository.findBySlug(slug);
    if (!province) throw new NotFoundException('Province not found');
    return new ProvinceEntity(province);
  }

  async update(slug: string, dto: UpdateProvinceDto): Promise<ProvinceEntity> {
    await this.findOne(slug);
    if (dto.slug && dto.slug !== slug) await this.assertSlugFree(dto.slug);

    const { bestSeason, sampleBudget } = dto;
    const province = await this.provincesRepository.update(slug, {
      slug: dto.slug,
      name: dto.name && toJson(dto.name),
      tagline: dto.tagline && toJson(dto.tagline),
      image: dto.image,
      interests: dto.interests,
      whyGo: dto.whyGo && toJson(dto.whyGo),
      bestSeasonMonths: bestSeason && toJson(bestSeason.months),
      bestSeasonDetail: bestSeason && toJson(bestSeason.detail),
      // `null` clears the field; omitting it leaves it unchanged.
      goodToKnow:
        dto.goodToKnow === null
          ? Prisma.DbNull
          : dto.goodToKnow && toJson(dto.goodToKnow),
      budgetStay: sampleBudget?.stay,
      budgetFood: sampleBudget?.food,
      budgetTransport: sampleBudget?.transport,
      budgetActivities: sampleBudget?.activities,
      budgetNote: sampleBudget && toJson(sampleBudget.note),
      sortOrder: dto.sortOrder,
      topPlaces: dto.topPlaces && {
        deleteMany: {},
        create: this.topPlaceRows(dto.topPlaces),
      },
      gettingThere: dto.gettingThere && {
        deleteMany: {},
        create: this.transportRows(dto.gettingThere),
      },
    });
    return new ProvinceEntity(province);
  }

  async remove(slug: string): Promise<void> {
    const province = await this.provincesRepository.findBySlug(slug);
    if (!province) throw new NotFoundException('Province not found');

    const dependents = await this.provincesRepository.countDependents(
      province.id,
    );
    if (dependents > 0) {
      throw new ConflictException(
        'Province still has hidden places or budget plans. Move or delete them first.',
      );
    }
    await this.provincesRepository.delete(slug);
  }

  /**
   * Turn province slugs (what the frontend and admin forms use) into row ids,
   * in the order given. Unknown slugs are a client error, not a 500.
   */
  async resolveIds(slugs: string[]): Promise<string[]> {
    const unique = [...new Set(slugs)];
    const rows = await this.provincesRepository.findIdsBySlugs(unique);
    const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));
    const unknown = unique.filter((s) => !idBySlug.has(s));
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown province slug: ${unknown.join(', ')}`,
      );
    }
    return unique.map((s) => idBySlug.get(s) as string);
  }

  private async assertSlugFree(slug: string): Promise<void> {
    if (await this.provincesRepository.findBySlug(slug)) {
      throw new ConflictException('Slug already exists');
    }
  }

  private topPlaceRows(
    places: CreateProvinceDto['topPlaces'],
  ): Prisma.ProvinceTopPlaceCreateWithoutProvinceInput[] {
    return places.map((p, i) => ({
      name: toJson(p.name),
      description: toJson(p.description),
      image: p.image,
      sortOrder: i,
    }));
  }

  private transportRows(
    options: CreateProvinceDto['gettingThere'],
  ): Prisma.ProvinceTransportCreateWithoutProvinceInput[] {
    return options.map((o, i) => ({
      mode: toJson(o.mode),
      detail: toJson(o.detail),
      sortOrder: i,
    }));
  }
}
