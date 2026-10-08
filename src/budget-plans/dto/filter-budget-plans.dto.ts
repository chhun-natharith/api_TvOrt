import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class FilterBudgetPlansDto extends ListQueryDto {
  @ApiPropertyOptional({ description: 'Province slug', example: 'kampot' })
  @IsOptional()
  @IsString()
  province?: string;
}
