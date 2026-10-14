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

function isLocalizedText(value: unknown): value is LocalizedText {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'en' in value &&
    typeof value.en === 'string' &&
    (!('kh' in value) || value.kh === undefined || typeof value.kh === 'string')
  );
}

/** Narrow a Prisma `Json` column (written through `LocalizedTextDto`) back to its type. */
export function asText(value: Prisma.JsonValue): LocalizedText {
  if (!isLocalizedText(value)) {
    throw new TypeError('JSON column is not a LocalizedText object');
  }
  return value;
}

export function asTextList(value: Prisma.JsonValue): LocalizedText[] {
  if (!Array.isArray(value)) {
    throw new TypeError('JSON column is not a LocalizedText array');
  }
  return value.map(asText);
}
