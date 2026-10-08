import type { Interest, Province } from '@prisma/client';
import { LocalizedText, asText } from '../../common/types/localized-text';
import { sumMoney, toNumber } from '../../common/utils/number.util';
import type { ProvinceWithDetail } from '../provinces.repository';

/** Card shape: lists, the homepage, and footer links. */
export class ProvinceSummaryEntity {
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  image: string;
  interests: Interest[];

  constructor(row: Province) {
    this.slug = row.slug;
    this.name = asText(row.name);
    this.tagline = asText(row.tagline);
    this.image = row.image;
    this.interests = row.interests;
  }
}

/** Full province page. Field names match the frontend's `Province` type. */
export class ProvinceEntity extends ProvinceSummaryEntity {
  whyGo: LocalizedText;
  topPlaces: {
    name: LocalizedText;
    description: LocalizedText;
    image: string;
  }[];
  gettingThere: { mode: LocalizedText; detail: LocalizedText }[];
  bestSeason: { months: LocalizedText; detail: LocalizedText };
  goodToKnow?: LocalizedText;
  sampleBudget: {
    stay: number;
    food: number;
    transport: number;
    activities: number;
    total: number;
    note: LocalizedText;
  };
  /** The province's first budget plan, if it has one. */
  planSlug?: string;
  sortOrder: number;

  constructor(row: ProvinceWithDetail) {
    super(row);
    this.whyGo = asText(row.whyGo);
    this.topPlaces = row.topPlaces.map((p) => ({
      name: asText(p.name),
      description: asText(p.description),
      image: p.image,
    }));
    this.gettingThere = row.gettingThere.map((g) => ({
      mode: asText(g.mode),
      detail: asText(g.detail),
    }));
    this.bestSeason = {
      months: asText(row.bestSeasonMonths),
      detail: asText(row.bestSeasonDetail),
    };
    if (row.goodToKnow) this.goodToKnow = asText(row.goodToKnow);
    const budget = [
      row.budgetStay,
      row.budgetFood,
      row.budgetTransport,
      row.budgetActivities,
    ];
    this.sampleBudget = {
      stay: toNumber(row.budgetStay),
      food: toNumber(row.budgetFood),
      transport: toNumber(row.budgetTransport),
      activities: toNumber(row.budgetActivities),
      total: sumMoney(budget),
      note: asText(row.budgetNote),
    };
    if (row.plans[0]) this.planSlug = row.plans[0].slug;
    this.sortOrder = row.sortOrder;
  }
}
