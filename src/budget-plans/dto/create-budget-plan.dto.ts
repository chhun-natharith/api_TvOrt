import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsImageRef } from '../../common/dto/image.dto';
import {
  Localized,
  LocalizedList,
  LocalizedTextDto,
} from '../../common/dto/localized-text.dto';
import { IsSlug } from '../../common/dto/slug.dto';

/** One line of the budget, in USD for the whole group. */
export class CostItemDto {
  @Localized() label: LocalizedTextDto;

  @ApiProperty({ example: 28 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;
}

/** Cost lines grouped by category. A category with no cost is an empty array. */
export class PlanCostsDto {
  @ApiProperty({ type: [CostItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostItemDto)
  transport: CostItemDto[];

  @ApiProperty({ type: [CostItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostItemDto)
  stay: CostItemDto[];

  @ApiProperty({ type: [CostItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostItemDto)
  food: CostItemDto[];

  @ApiProperty({ type: [CostItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostItemDto)
  activities: CostItemDto[];
}

/** One day of the itinerary. Day number = position in the array. */
export class OutlineDayDto {
  @Localized() title: LocalizedTextDto;
  @LocalizedList() items: LocalizedTextDto[];
}

export class CreateBudgetPlanDto {
  @IsSlug() slug: string;
  @Localized() title: LocalizedTextDto;

  @ApiProperty({ description: 'Province slug', example: 'kampot' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @IsImageRef() image: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  days: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  people: number;

  @Localized() summary: LocalizedTextDto;

  @ApiProperty({ type: PlanCostsDto })
  @ValidateNested()
  @Type(() => PlanCostsDto)
  costs: PlanCostsDto;

  @ApiProperty({ type: [OutlineDayDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OutlineDayDto)
  outline: OutlineDayDto[];

  @LocalizedList() tips: LocalizedTextDto[];

  @ApiPropertyOptional({ description: 'Display order, lowest first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
