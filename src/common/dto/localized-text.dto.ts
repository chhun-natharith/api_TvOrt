import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { LocalizedText } from '../types/localized-text';

export class LocalizedTextDto implements LocalizedText {
  @ApiProperty({ example: 'Phnom Penh' })
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiPropertyOptional({ example: 'ភ្នំពេញ' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kh?: string;
}

/** Validate a nested required localized field: `@Localized() name: LocalizedTextDto` */
export function Localized(): PropertyDecorator {
  return (target, key) => {
    ValidateNested()(target, key);
    Type(() => LocalizedTextDto)(target, key);
    ApiProperty({ type: LocalizedTextDto })(target, key);
  };
}

/** Validate a nested optional localized field. */
export function LocalizedOptional(): PropertyDecorator {
  return (target, key) => {
    IsOptional()(target, key);
    ValidateNested()(target, key);
    Type(() => LocalizedTextDto)(target, key);
    ApiPropertyOptional({ type: LocalizedTextDto })(target, key);
  };
}

/** Validate a required array of localized strings (tips, itinerary items). */
export function LocalizedList(): PropertyDecorator {
  return (target, key) => {
    IsArray()(target, key);
    ValidateNested({ each: true })(target, key);
    Type(() => LocalizedTextDto)(target, key);
    ApiProperty({ type: [LocalizedTextDto] })(target, key);
  };
}
