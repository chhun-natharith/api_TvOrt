import type { Prisma } from '@prisma/client';

/** Prisma returns `Decimal` objects; the API speaks plain JSON numbers (USD). */
export function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

/** Sum amounts and round to cents, so 0.1 + 0.2 doesn't leak as 0.30000000000000004. */
export function sumMoney(values: Array<Prisma.Decimal | number>): number {
  const total = values.reduce<number>((sum, v) => sum + toNumber(v), 0);
  return Math.round(total * 100) / 100;
}
