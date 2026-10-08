import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationDto } from './pagination.dto';

/**
 * Pagination for public content lists. The site shows whole lists (a few dozen
 * items at most), so the default page is the maximum instead of 10 — a client
 * that forgets `?limit=` must not silently get a truncated list.
 */
export class ListQueryDto extends PaginationDto {
  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  override limit: number = 100;
}
