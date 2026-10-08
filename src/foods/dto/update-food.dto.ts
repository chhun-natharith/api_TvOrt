import { PartialType } from '@nestjs/swagger';
import { CreateFoodDto } from './create-food.dto';

/**
 * Every field is optional. `whereToTry` and `provinces`, when sent, replace
 * the whole list.
 */
export class UpdateFoodDto extends PartialType(CreateFoodDto) {}
