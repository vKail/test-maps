import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationDto } from './dto/location.dto';

@Controller('location')
export class LocationController {
  private readonly logger = new Logger(LocationController.name);

  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createLocation(@Body() locationDto: LocationDto) {
    this.logger.log(`Intentando crear ubicación: ${JSON.stringify(locationDto)}`);
    try {
      const result = await this.locationService.saveLocation(locationDto);
      this.logger.log(`Ubicación creada: ${JSON.stringify(result)}`);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error al crear ubicación: ${error.message}`);
      throw error;
    }
  }

  @Get('test')
  async testLocation() {
    const testLocation: LocationDto = {
      latitud: -12.0464,
      longitud: -77.0428,
      hora: new Date()
    };

    this.logger.log(`Probando con ubicación de prueba: ${JSON.stringify(testLocation)}`);
    
    try {
      const result = await this.locationService.saveLocation(testLocation);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Error en prueba: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}