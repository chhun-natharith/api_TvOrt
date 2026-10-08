import type { Prisma } from '@prisma/client';
import type { LocalizedText } from '../types/localized-text';

/**
 * Copy a (validated) localized value into a plain object for a Prisma `Json`
 * column. DTO instances are class instances and `kh` may be `undefined`.
 */
export function toJson(text: LocalizedText): Prisma.InputJsonObject {
  return text.kh ? { en: text.en, kh: text.kh } : { en: text.en };
}

export function toJsonList(texts: LocalizedText[]): Prisma.InputJsonArray {
  return texts.map(toJson);
}
