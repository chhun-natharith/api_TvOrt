import { PaginationDto } from '../dto/pagination.dto';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function skipOf({ page, limit }: PaginationDto): number {
  return (page - 1) * limit;
}

export function toPage<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationDto,
): Page<T> {
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
