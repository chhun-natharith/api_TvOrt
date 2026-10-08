import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  Localized,
  LocalizedTextDto,
} from '../../common/dto/localized-text.dto';
import { IsSlug } from '../../common/dto/slug.dto';

/** USD. */
export class PlaceCostDto {
  @ApiProperty({ example: 5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  min: number;

  @ApiProperty({ example: 45 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  max: number;

  @Localized() note: LocalizedTextDto;
}

export class CreateHiddenPlaceDto {
  @IsSlug() slug: string;
  @Localized() name: LocalizedTextDto;

  @ApiPropertyOptional({ example: 'ប្រាសាទបឹងមាលា' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  khmerName?: string;

  @ApiProperty({ description: 'Province slug', example: 'siem-reap' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ enum: PlaceCategory })
  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @ApiProperty({
    type: [String],
    description: 'Image references in display order; the first is the cover',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(500, { each: true })
  images: string[];

  @Localized() summary: LocalizedTextDto;
  @Localized() special: LocalizedTextDto;
  @Localized() howToReach: LocalizedTextDto;

  @ApiProperty({ type: PlaceCostDto })
  @ValidateNested()
  @Type(() => PlaceCostDto)
  cost: PlaceCostDto;

  @Localized() bestTime: LocalizedTextDto;

  @ApiPropertyOptional({ description: 'Display order, lowest first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
