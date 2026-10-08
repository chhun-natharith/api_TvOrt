import { ApiPropertyOptional } from '@nestjs/swagger';
import { Interest } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '../../common/dto/list-query.dto';

export class FilterProvincesDto extends ListQueryDto {
  @ApiPropertyOptional({ enum: Interest })
  @IsOptional()
  @IsEnum(Interest)
  interest?: Interest;
}
