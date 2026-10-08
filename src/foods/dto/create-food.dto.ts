import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FoodType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
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
  LocalizedTextDto,
} from '../../common/dto/localized-text.dto';
import { IsSlug } from '../../common/dto/slug.dto';

export class FoodVenueDto {
  @Localized() name: LocalizedTextDto;
  @Localized() detail: LocalizedTextDto;
}

/** USD. */
export class FoodPriceDto {
  @ApiProperty({ example: 3 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  min: number;

  @ApiProperty({ example: 8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  max: number;

  @Localized() unit: LocalizedTextDto;
}

export class CreateFoodDto {
  @IsSlug() slug: string;
  @Localized() name: LocalizedTextDto;

  @ApiProperty({ example: 'អាម៉ុកត្រី' })
  @IsString()
  @IsNotEmpty()
  khmerName: string;

  @ApiProperty({ example: 'ah-mok trey' })
  @IsString()
  @IsNotEmpty()
  pronunciation: string;

  @ApiProperty({ enum: FoodType })
  @IsEnum(FoodType)
  type: FoodType;

  @ApiProperty({ type: [String], example: ['siem-reap', 'phnom-penh'] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  provinces: string[];

  @IsImageRef() image: string;
  @Localized() summary: LocalizedTextDto;
  @Localized() whatItIs: LocalizedTextDto;

  @ApiProperty({ type: [FoodVenueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodVenueDto)
  whereToTry: FoodVenueDto[];

  @ApiProperty({ type: FoodPriceDto })
  @ValidateNested()
  @Type(() => FoodPriceDto)
  price: FoodPriceDto;

  @ApiPropertyOptional({ description: 'Display order, lowest first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
