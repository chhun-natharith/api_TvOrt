import { Module } from '@nestjs/common';
import { ProvincesModule } from '../provinces/provinces.module';
import { HiddenPlacesController } from './hidden-places.controller';
import { HiddenPlacesRepository } from './hidden-places.repository';
import { HiddenPlacesService } from './hidden-places.service';

@Module({
  imports: [ProvincesModule],
  controllers: [HiddenPlacesController],
  providers: [HiddenPlacesService, HiddenPlacesRepository],
})
export class HiddenPlacesModule {}
