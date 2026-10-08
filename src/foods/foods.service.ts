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
import { CreateFoodDto, FoodPriceDto } from './dto/create-food.dto';
import { FilterFoodsDto } from './dto/filter-foods.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { FoodEntity, FoodSummaryEntity } from './entities/food.entity';
import { FoodsRepository, FoodWithDetail } from './foods.repository';

const RELATED_COUNT = 3;

@Injectable()
export class FoodsService {
  constructor(
    private readonly foodsRepository: FoodsRepository,
    private readonly provincesService: ProvincesService,
  ) {}

  async create(dto: CreateFoodDto): Promise<FoodEntity> {
    await this.assertSlugFree(dto.slug);
    this.assertPriceRange(dto.price);
    const provinceIds = await this.provincesService.resolveIds(dto.provinces);

    const food = await this.foodsRepository.create({
      slug: dto.slug,
      name: toJson(dto.name),
      khmerName: dto.khmerName,
      pronunciation: dto.pronunciation,
      type: dto.type,
      image: dto.image,
      summary: toJson(dto.summary),
      whatItIs: toJson(dto.whatItIs),
      priceMin: dto.price.min,
      priceMax: dto.price.max,
      priceUnit: toJson(dto.price.unit),
      sortOrder: dto.sortOrder,
      provinces: { connect: provinceIds.map((id) => ({ id })) },
      venues: { create: this.venueRows(dto.whereToTry) },
    });
    return this.toEntity(food);
  }

  async findAll(filter: FilterFoodsDto) {
    const where: Prisma.FoodWhereInput = {
      type: filter.type,
      provinces: filter.province
        ? { some: { slug: filter.province } }
        : undefined,
    };
    const [items, total] = await Promise.all([
      this.foodsRepository.findAll(skipOf(filter), filter.limit, where),
      this.foodsRepository.count(where),
    ]);
    return toPage(
      items.map((f) => new FoodSummaryEntity(f)),
      total,
      filter,
    );
  }

  async findOne(slug: string): Promise<FoodEntity> {
    return this.toEntity(await this.mustFindBySlug(slug));
  }

  async update(slug: string, dto: UpdateFoodDto): Promise<FoodEntity> {
    await this.mustFindBySlug(slug);
    if (dto.slug && dto.slug !== slug) await this.assertSlugFree(dto.slug);
    if (dto.price) this.assertPriceRange(dto.price);
    const provinceIds =
      dto.provinces && (await this.provincesService.resolveIds(dto.provinces));

    const food = await this.foodsRepository.update(slug, {
      slug: dto.slug,
      name: dto.name && toJson(dto.name),
      khmerName: dto.khmerName,
      pronunciation: dto.pronunciation,
      type: dto.type,
      image: dto.image,
      summary: dto.summary && toJson(dto.summary),
      whatItIs: dto.whatItIs && toJson(dto.whatItIs),
      priceMin: dto.price?.min,
      priceMax: dto.price?.max,
      priceUnit: dto.price && toJson(dto.price.unit),
      sortOrder: dto.sortOrder,
      provinces: provinceIds && { set: provinceIds.map((id) => ({ id })) },
      venues: dto.whereToTry && {
        deleteMany: {},
        create: this.venueRows(dto.whereToTry),
      },
    });
    return this.toEntity(food);
  }

  async remove(slug: string): Promise<void> {
    await this.mustFindBySlug(slug);
    await this.foodsRepository.delete(slug);
  }

  private async mustFindBySlug(slug: string): Promise<FoodWithDetail> {
    const food = await this.foodsRepository.findBySlug(slug);
    if (!food) throw new NotFoundException('Food not found');
    return food;
  }

  private async toEntity(food: FoodWithDetail): Promise<FoodEntity> {
    const related = await this.foodsRepository.findRelated(
      food.id,
      food.provinces.map((p) => p.id),
      RELATED_COUNT,
    );
    return new FoodEntity(food, related);
  }

  private async assertSlugFree(slug: string): Promise<void> {
    if (await this.foodsRepository.findBySlug(slug)) {
      throw new ConflictException('Slug already exists');
    }
  }

  private assertPriceRange(price: FoodPriceDto): void {
    if (price.min > price.max) {
      throw new BadRequestException(
        'price.min cannot be greater than price.max',
      );
    }
  }

  private venueRows(
    venues: CreateFoodDto['whereToTry'],
  ): Prisma.FoodVenueCreateWithoutFoodInput[] {
    return venues.map((v, i) => ({
      name: toJson(v.name),
      detail: toJson(v.detail),
      sortOrder: i,
    }));
  }
}
