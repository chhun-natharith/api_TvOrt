import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class FilterHiddenPlacesDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Province slug', example: 'kampot' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ enum: PlaceCategory })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;
}
