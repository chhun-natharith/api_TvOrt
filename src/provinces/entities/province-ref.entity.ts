import { LocalizedText, asText } from '../../common/types/localized-text';
import type { Prisma } from '@prisma/client';

/** The minimum another page needs to link to a province. */
export class ProvinceRefEntity {
  slug: string;
  name: LocalizedText;

  constructor(row: { slug: string; name: Prisma.JsonValue }) {
    this.slug = row.slug;
    this.name = asText(row.name);
  }
}
