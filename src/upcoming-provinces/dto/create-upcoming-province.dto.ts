import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Interest } from '@prisma/client';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { IsImageRef } from '../../common/dto/image.dto';
import {
  Localized,
  LocalizedTextDto,
} from '../../common/dto/localized-text.dto';

export class CreateUpcomingProvinceDto {
  @Localized() name: LocalizedTextDto;
  @IsImageRef() image: string;

  @ApiProperty({ enum: Interest, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsEnum(Interest, { each: true })
  interests: Interest[];

  @ApiPropertyOptional({ description: 'Display order, lowest first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
