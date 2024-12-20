import { Injectable, Logger } from '@nestjs/common';
import { supabase } from '../config/supabase.config';
import { LocationDto } from './dto/location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  async saveLocation(locationData: LocationDto): Promise<Location> {
    try {
      this.logger.debug(`Intentando guardar ubicación: ${JSON.stringify(locationData)}`);

      // Asegurarse de que los números son enteros
      const locationToSave = {
        latitud: Math.round(Number(locationData.latitud)),
        longitud: Math.round(Number(locationData.longitud)),
        hora: new Date(locationData.hora).toISOString()
      };

      this.logger.debug(`Datos formateados para guardar: ${JSON.stringify(locationToSave)}`);

      const { data, error } = await supabase
        .from('Expo')
        .insert([locationToSave])
        .select('*')
        .single();

      if (error) {
        this.logger.error(`Error de Supabase: ${JSON.stringify(error)}`);
        throw new Error(`Error al guardar ubicación: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se recibieron datos después de la inserción');
      }

      this.logger.log(`Ubicación guardada exitosamente: ${JSON.stringify(data)}`);
      return data as Location;

    } catch (error) {
      this.logger.error(`Error en saveLocation: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }
}
