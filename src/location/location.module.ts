import { Module } from '@nestjs/common';
import { LocationGateway } from './location.gateway';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  controllers: [LocationController],
  providers: [LocationGateway, LocationService],
  exports: [LocationService],
})
export class LocationModule {}