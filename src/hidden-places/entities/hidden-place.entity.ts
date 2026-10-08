import type { PlaceCategory } from '@prisma/client';
import { LocalizedText, asText } from '../../common/types/localized-text';
import { toNumber } from '../../common/utils/number.util';
import { ProvinceRefEntity } from '../../provinces/entities/province-ref.entity';
import type { HiddenPlaceWithProvince } from '../hidden-places.repository';

/** Card shape: lists, homepage, "more in this province" strip. */
export class HiddenPlaceSummaryEntity {
  slug: string;
  name: LocalizedText;
  province: ProvinceRefEntity;
  category: PlaceCategory;
  /** Cover photo (first of `images`). */
  image: string;
  summary: LocalizedText;

  constructor(row: HiddenPlaceWithProvince) {
    this.slug = row.slug;
    this.name = asText(row.name);
    this.province = new ProvinceRefEntity(row.province);
    this.category = row.category;
    this.image = row.images[0];
    this.summary = asText(row.summary);
  }
}

/** Full place page. */
export class HiddenPlaceEntity extends HiddenPlaceSummaryEntity {
  khmerName?: string;
  images: string[];
  special: LocalizedText;
  howToReach: LocalizedText;
  cost: { min: number; max: number; note: LocalizedText };
  bestTime: LocalizedText;
  /** Up to 3 other places in the same province. */
  related: HiddenPlaceSummaryEntity[];
  sortOrder: number;

  constructor(
    row: HiddenPlaceWithProvince,
    related: HiddenPlaceWithProvince[],
  ) {
    super(row);
    if (row.khmerName) this.khmerName = row.khmerName;
    this.images = row.images;
    this.special = asText(row.special);
    this.howToReach = asText(row.howToReach);
    this.cost = {
      min: toNumber(row.costMin),
      max: toNumber(row.costMax),
      note: asText(row.costNote),
    };
    this.bestTime = asText(row.bestTime);
    this.related = related.map((p) => new HiddenPlaceSummaryEntity(p));
    this.sortOrder = row.sortOrder;
  }
}
