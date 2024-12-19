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

      // Formatear los datos según el esquema de la tabla
      const locationToSave = {
        latitud: Math.round(locationData.latitud), // Convertir a entero ya que el esquema usa int8
        longitud: Math.round(locationData.longitud), // Convertir a entero ya que el esquema usa int8
        hora: new Date(locationData.hora).toISOString()
      };

      this.logger.debug(`Datos formateados para guardar: ${JSON.stringify(locationToSave)}`);

      const { data, error } = await supabase
        .from('Expo')
        .insert([locationToSave])
        .select();

      if (error) {
        this.logger.error(`Error de Supabase: ${JSON.stringify(error)}`);
        throw new Error(`Error al guardar ubicación: ${error.message}`);
      }

      this.logger.log(`Ubicación guardada exitosamente: ${JSON.stringify(data)}`);
      return data[0] as Location;

    } catch (error) {
      this.logger.error(`Error en saveLocation: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }
}