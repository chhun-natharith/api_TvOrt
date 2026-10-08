import { PartialType } from '@nestjs/swagger';
import { CreateBudgetPlanDto } from './create-budget-plan.dto';

/**
 * Every field is optional. `costs`, `outline` and `tips`, when sent, replace
 * the whole thing.
 */
export class UpdateBudgetPlanDto extends PartialType(CreateBudgetPlanDto) {}
