import { PartialType } from '@nestjs/swagger';
import { CreateProvinceDto } from './create-province.dto';

/**
 * Every field is optional. `topPlaces` and `gettingThere`, when sent, replace
 * the whole list.
 */
export class UpdateProvinceDto extends PartialType(CreateProvinceDto) {}
