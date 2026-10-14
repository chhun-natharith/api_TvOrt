import type { CostCategory } from '@prisma/client';
import {
  LocalizedText,
  asText,
  asTextList,
} from '../../common/types/localized-text';
import { sumMoney, toNumber } from '../../common/utils/number.util';
import { ProvinceRefEntity } from '../../provinces/entities/province-ref.entity';
import type {
  BudgetPlanWithDetail,
  BudgetPlanWithTotals,
} from '../budget-plans.repository';

interface CostLine {
  label: LocalizedText;
  amount: number;
}

/** Build a value for every category; the compiler fails if one is missing. */
function byCategory<T>(
  build: (category: CostCategory) => T,
): Record<CostCategory, T> {
  return {
    transport: build('transport'),
    stay: build('stay'),
    food: build('food'),
    activities: build('activities'),
  };
}

/** Card shape: lists and the homepage. `total` is for the whole group, USD. */
export class BudgetPlanSummaryEntity {
  slug: string;
  title: LocalizedText;
  province: ProvinceRefEntity;
  image: string;
  days: number;
  people: number;
  summary: LocalizedText;
  total: number;

  constructor(row: BudgetPlanWithTotals) {
    this.slug = row.slug;
    this.title = asText(row.title);
    this.province = new ProvinceRefEntity(row.province);
    this.image = row.image;
    this.days = row.days;
    this.people = row.people;
    this.summary = asText(row.summary);
    this.total = sumMoney(row.costs.map((c) => c.amount));
  }
}

/** Full plan page. Same shape as the frontend's `BudgetPlan`, plus totals. */
export class BudgetPlanEntity extends BudgetPlanSummaryEntity {
  costs: Record<CostCategory, CostLine[]>;
  categoryTotals: Record<CostCategory, number>;
  outline: { title: LocalizedText; items: LocalizedText[] }[];
  tips: LocalizedText[];
  sortOrder: number;

  constructor(row: BudgetPlanWithDetail) {
    super(row);
    this.costs = byCategory((category) =>
      row.costs
        .filter((c) => c.category === category)
        .map((c) => ({ label: asText(c.label), amount: toNumber(c.amount) })),
    );
    this.categoryTotals = byCategory((category) =>
      sumMoney(this.costs[category].map((c) => c.amount)),
    );
    this.outline = row.outline.map((day) => ({
      title: asText(day.title),
      items: asTextList(day.items),
    }));
    this.tips = asTextList(row.tips);
    this.sortOrder = row.sortOrder;
  }
}
