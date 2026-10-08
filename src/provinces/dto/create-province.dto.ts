import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Interest } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsImageRef } from '../../common/dto/image.dto';
import {
  Localized,
  LocalizedOptional,
  LocalizedTextDto,
} from '../../common/dto/localized-text.dto';
import { IsSlug } from '../../common/dto/slug.dto';

export class TopPlaceDto {
  @Localized() name: LocalizedTextDto;
  @Localized() description: LocalizedTextDto;
  @IsImageRef() image: string;
}

export class TransportDto {
  @Localized() mode: LocalizedTextDto;
  @Localized() detail: LocalizedTextDto;
}

export class BestSeasonDto {
  @Localized() months: LocalizedTextDto;
  @Localized() detail: LocalizedTextDto;
}

/** USD per person per day. */
export class SampleBudgetDto {
  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  stay: number;

  @ApiProperty({ example: 8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  food: number;

  @ApiProperty({ example: 4 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  transport: number;

  @ApiProperty({ example: 8 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  activities: number;

  @Localized() note: LocalizedTextDto;
}

export class CreateProvinceDto {
  @IsSlug() slug: string;
  @Localized() name: LocalizedTextDto;
  @Localized() tagline: LocalizedTextDto;
  @IsImageRef() image: string;

  @ApiProperty({ enum: Interest, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsEnum(Interest, { each: true })
  interests: Interest[];

  @Localized() whyGo: LocalizedTextDto;

  @ApiProperty({ type: [TopPlaceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopPlaceDto)
  topPlaces: TopPlaceDto[];

  @ApiProperty({ type: [TransportDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportDto)
  gettingThere: TransportDto[];

  @ApiProperty({ type: BestSeasonDto })
  @ValidateNested()
  @Type(() => BestSeasonDto)
  bestSeason: BestSeasonDto;

  @LocalizedOptional() goodToKnow?: LocalizedTextDto;

  @ApiProperty({ type: SampleBudgetDto })
  @ValidateNested()
  @Type(() => SampleBudgetDto)
  sampleBudget: SampleBudgetDto;

  @ApiPropertyOptional({ description: 'Display order, lowest first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
