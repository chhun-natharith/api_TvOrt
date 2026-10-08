import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { toJson } from '../common/utils/json.util';
import { skipOf, toPage } from '../common/utils/pagination.util';
import { ProvincesService } from '../provinces/provinces.service';
import {
  CreateHiddenPlaceDto,
  PlaceCostDto,
} from './dto/create-hidden-place.dto';
import { FilterHiddenPlacesDto } from './dto/filter-hidden-places.dto';
import { UpdateHiddenPlaceDto } from './dto/update-hidden-place.dto';
import {
  HiddenPlaceEntity,
  HiddenPlaceSummaryEntity,
} from './entities/hidden-place.entity';
import {
  HiddenPlacesRepository,
  HiddenPlaceWithProvince,
} from './hidden-places.repository';

const RELATED_COUNT = 3;

@Injectable()
export class HiddenPlacesService {
  constructor(
    private readonly placesRepository: HiddenPlacesRepository,
    private readonly provincesService: ProvincesService,
  ) {}

  async create(dto: CreateHiddenPlaceDto): Promise<HiddenPlaceEntity> {
    await this.assertSlugFree(dto.slug);
    this.assertCostRange(dto.cost);
    const [provinceId] = await this.provincesService.resolveIds([dto.province]);

    const place = await this.placesRepository.create({
      slug: dto.slug,
      name: toJson(dto.name),
      khmerName: dto.khmerName,
      province: { connect: { id: provinceId } },
      category: dto.category,
      images: dto.images,
      summary: toJson(dto.summary),
      special: toJson(dto.special),
      howToReach: toJson(dto.howToReach),
      costMin: dto.cost.min,
      costMax: dto.cost.max,
      costNote: toJson(dto.cost.note),
      bestTime: toJson(dto.bestTime),
      sortOrder: dto.sortOrder,
    });
    return this.toEntity(place);
  }

  async findAll(filter: FilterHiddenPlacesDto) {
    const where: Prisma.HiddenPlaceWhereInput = {
      category: filter.category,
      province: filter.province ? { slug: filter.province } : undefined,
    };
    const [items, total] = await Promise.all([
      this.placesRepository.findAll(skipOf(filter), filter.limit, where),
      this.placesRepository.count(where),
    ]);
    return toPage(
      items.map((p) => new HiddenPlaceSummaryEntity(p)),
      total,
      filter,
    );
  }

  async findOne(slug: string): Promise<HiddenPlaceEntity> {
    return this.toEntity(await this.mustFindBySlug(slug));
  }

  async update(
    slug: string,
    dto: UpdateHiddenPlaceDto,
  ): Promise<HiddenPlaceEntity> {
    await this.mustFindBySlug(slug);
    if (dto.slug && dto.slug !== slug) await this.assertSlugFree(dto.slug);
    if (dto.cost) this.assertCostRange(dto.cost);
    const provinceId =
      dto.province &&
      (await this.provincesService.resolveIds([dto.province]))[0];

    const place = await this.placesRepository.update(slug, {
      slug: dto.slug,
      name: dto.name && toJson(dto.name),
      khmerName: dto.khmerName,
      province: provinceId ? { connect: { id: provinceId } } : undefined,
      category: dto.category,
      images: dto.images,
      summary: dto.summary && toJson(dto.summary),
      special: dto.special && toJson(dto.special),
      howToReach: dto.howToReach && toJson(dto.howToReach),
      costMin: dto.cost?.min,
      costMax: dto.cost?.max,
      costNote: dto.cost && toJson(dto.cost.note),
      bestTime: dto.bestTime && toJson(dto.bestTime),
      sortOrder: dto.sortOrder,
    });
    return this.toEntity(place);
  }

  async remove(slug: string): Promise<void> {
    await this.mustFindBySlug(slug);
    await this.placesRepository.delete(slug);
  }

  private async mustFindBySlug(slug: string): Promise<HiddenPlaceWithProvince> {
    const place = await this.placesRepository.findBySlug(slug);
    if (!place) throw new NotFoundException('Hidden place not found');
    return place;
  }

  private async toEntity(
    place: HiddenPlaceWithProvince,
  ): Promise<HiddenPlaceEntity> {
    const related = await this.placesRepository.findRelated(
      place.id,
      place.provinceId,
      RELATED_COUNT,
    );
    return new HiddenPlaceEntity(place, related);
  }

  private async assertSlugFree(slug: string): Promise<void> {
    if (await this.placesRepository.findBySlug(slug)) {
      throw new ConflictException('Slug already exists');
    }
  }

  private assertCostRange(cost: PlaceCostDto): void {
    if (cost.min > cost.max) {
      throw new BadRequestException('cost.min cannot be greater than cost.max');
    }
  }
}
