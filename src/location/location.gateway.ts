import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationService } from './location.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  namespace: '/location',
  transports: ['websocket', 'polling']
})
export class LocationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private logger = new Logger('LocationGateway');
  
  constructor(private locationService: LocationService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    // Configurar el cliente para recibir mensajes raw
    client.on('message', this.handleRawMessage.bind(this, client));
    client.emit('connected', { message: 'Conectado al servidor de ubicación' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  private async handleRawMessage(client: Socket, message: any) {
    this.logger.debug(`Mensaje raw recibido: ${JSON.stringify(message)}`);
    try {
      const payload = typeof message === 'string' ? JSON.parse(message) : message;
      await this.processLocation(client, payload);
    } catch (error) {
      this.logger.error(`Error procesando mensaje raw: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('updateLocation')
  async handleLocation(client: Socket, payload: any) {
    this.logger.debug(`Evento updateLocation recibido: ${JSON.stringify(payload)}`);
    return this.processLocation(client, payload);
  }

  private async processLocation(client: Socket, payload: any) {
    try {
      // Extraer los datos de ubicación
      const locationData = this.extractLocationData(payload);
      
      if (!locationData) {
        throw new Error('Datos de ubicación no válidos');
      }

      this.logger.log(`Procesando ubicación: ${JSON.stringify(locationData)}`);
      
      const savedLocation = await this.locationService.saveLocation(locationData);
      
      this.logger.log(`Ubicación guardada: ${JSON.stringify(savedLocation)}`);
      
      const response = {
        success: true,
        data: savedLocation
      };

      client.emit('locationSaved', response);

      return {
        event: 'locationUpdated',
        data: savedLocation
      };

    } catch (error) {
      this.logger.error(`Error al procesar ubicación: ${error.message}`);
      const errorResponse = {
        success: false,
        error: error.message
      };
      client.emit('locationError', errorResponse);
      return errorResponse;
    }
  }

  private extractLocationData(payload: any): any {
    this.logger.debug(`Extrayendo datos de ubicación de: ${JSON.stringify(payload)}`);
    
    // Si el payload es un objeto con los campos directamente
    if (payload.latitud && payload.longitud) {
      return {
        latitud: Number(payload.latitud),
        longitud: Number(payload.longitud),
        hora: payload.hora || new Date().toISOString()
      };
    }
    
    // Si el payload tiene un campo 'data'
    if (payload.data) {
      const data = payload.data;
      return {
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        hora: data.hora || new Date().toISOString()
      };
    }

    // Si el payload tiene un campo 'event' (formato común en WebSockets)
    if (payload.event === 'updateLocation' && payload.data) {
      const data = payload.data;
      return {
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        hora: data.hora || new Date().toISOString()
      };
    }

    return null;
  }
}