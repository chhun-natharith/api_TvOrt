import { PartialType } from '@nestjs/swagger';
import { CreateUpcomingProvinceDto } from './create-upcoming-province.dto';

export class UpdateUpcomingProvinceDto extends PartialType(
  CreateUpcomingProvinceDto,
) {}
