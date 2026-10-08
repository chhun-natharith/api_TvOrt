import { Module } from '@nestjs/common';
import { ProvincesController } from './provinces.controller';
import { ProvincesRepository } from './provinces.repository';
import { ProvincesService } from './provinces.service';

@Module({
  controllers: [ProvincesController],
  providers: [ProvincesService, ProvincesRepository],
  exports: [ProvincesService],
})
export class ProvincesModule {}
