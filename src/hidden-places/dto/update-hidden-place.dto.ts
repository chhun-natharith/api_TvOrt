import { PartialType } from '@nestjs/swagger';
import { CreateHiddenPlaceDto } from './create-hidden-place.dto';

/** Every field is optional. `images`, when sent, replaces the whole list. */
export class UpdateHiddenPlaceDto extends PartialType(CreateHiddenPlaceDto) {}
