import { Module } from '@nestjs/common';
import { ProvincesModule } from '../provinces/provinces.module';
import { BudgetPlansController } from './budget-plans.controller';
import { BudgetPlansRepository } from './budget-plans.repository';
import { BudgetPlansService } from './budget-plans.service';

@Module({
  imports: [ProvincesModule],
  controllers: [BudgetPlansController],
  providers: [BudgetPlansService, BudgetPlansRepository],
})
export class BudgetPlansModule {}
