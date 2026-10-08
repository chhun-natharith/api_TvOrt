import type { Interest, UpcomingProvince } from '@prisma/client';
import { LocalizedText, asText } from '../../common/types/localized-text';

export class UpcomingProvinceEntity {
  id: string;
  name: LocalizedText;
  image: string;
  interests: Interest[];
  sortOrder: number;

  constructor(row: UpcomingProvince) {
    this.id = row.id;
    this.name = asText(row.name);
    this.image = row.image;
    this.interests = row.interests;
    this.sortOrder = row.sortOrder;
  }
}
