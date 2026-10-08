import { Module } from '@nestjs/common';
import { UpcomingProvincesController } from './upcoming-provinces.controller';
import { UpcomingProvincesRepository } from './upcoming-provinces.repository';
import { UpcomingProvincesService } from './upcoming-provinces.service';

@Module({
  controllers: [UpcomingProvincesController],
  providers: [UpcomingProvincesService, UpcomingProvincesRepository],
  exports: [UpcomingProvincesService],
})
export class UpcomingProvincesModule {}
