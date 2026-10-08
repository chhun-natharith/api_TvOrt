import type { Prisma } from '@prisma/client';

/**
 * A piece of content in English with an optional Khmer translation.
 * Same shape as the frontend's `Text` object form, so `tx(value, locale)`
 * works on API responses unchanged.
 */
export interface LocalizedText {
  en: string;
  kh?: string;
}

/** Narrow a Prisma `Json` column (written through `LocalizedTextDto`) back to its type. */
export function asText(value: Prisma.JsonValue): LocalizedText {
  return value as unknown as LocalizedText;
}

export function asTextList(value: Prisma.JsonValue): LocalizedText[] {
  return value as unknown as LocalizedText[];
}
