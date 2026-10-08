import { ApiPropertyOptional } from '@nestjs/swagger';
import { FoodType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class FilterFoodsDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Province slug', example: 'kampot' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ enum: FoodType })
  @IsOptional()
  @IsEnum(FoodType)
  type?: FoodType;
}
