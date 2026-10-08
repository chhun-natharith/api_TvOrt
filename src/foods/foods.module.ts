import { Module } from '@nestjs/common';
import { ProvincesModule } from '../provinces/provinces.module';
import { FoodsController } from './foods.controller';
import { FoodsRepository } from './foods.repository';
import { FoodsService } from './foods.service';

@Module({
  imports: [ProvincesModule],
  controllers: [FoodsController],
  providers: [FoodsService, FoodsRepository],
})
export class FoodsModule {}
