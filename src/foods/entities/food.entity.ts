import type { Food, FoodType } from '@prisma/client';
import { LocalizedText, asText } from '../../common/types/localized-text';
import { toNumber } from '../../common/utils/number.util';
import { ProvinceRefEntity } from '../../provinces/entities/province-ref.entity';
import type { FoodWithDetail } from '../foods.repository';

/** Card shape: lists, homepage, "related" strip. */
export class FoodSummaryEntity {
  slug: string;
  name: LocalizedText;
  khmerName: string;
  pronunciation: string;
  type: FoodType;
  image: string;
  summary: LocalizedText;
  price: { min: number; max: number; unit: LocalizedText };

  constructor(row: Food) {
    this.slug = row.slug;
    this.name = asText(row.name);
    this.khmerName = row.khmerName;
    this.pronunciation = row.pronunciation;
    this.type = row.type;
    this.image = row.image;
    this.summary = asText(row.summary);
    this.price = {
      min: toNumber(row.priceMin),
      max: toNumber(row.priceMax),
      unit: asText(row.priceUnit),
    };
  }
}

/** Full food page. */
export class FoodEntity extends FoodSummaryEntity {
  whatItIs: LocalizedText;
  whereToTry: { name: LocalizedText; detail: LocalizedText }[];
  /** Where it's found, ready to link to. */
  provinces: ProvinceRefEntity[];
  /** Up to 3 other foods from the same provinces. */
  related: FoodSummaryEntity[];
  sortOrder: number;

  constructor(row: FoodWithDetail, related: Food[]) {
    super(row);
    this.whatItIs = asText(row.whatItIs);
    this.whereToTry = row.venues.map((v) => ({
      name: asText(v.name),
      detail: asText(v.detail),
    }));
    this.provinces = row.provinces.map((p) => new ProvinceRefEntity(p));
    this.related = related.map((f) => new FoodSummaryEntity(f));
    this.sortOrder = row.sortOrder;
  }
}
