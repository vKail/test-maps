import { WebSocketGateway, SubscribeMessage, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationService } from './location.service';

@WebSocketGateway({
  cors: {
    origin: 'https://test-maps-imvz.onrender.com',  // Cambia esta URL según la necesidad
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
  namespace: '/location',
  transports: ['websocket'],
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
    // Emitir mensaje de bienvenida para confirmar conexión
    client.emit('connected', { message: 'Conectado al servidor de ubicación' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  async handleLocation(client: Socket, payload: any) {
    this.logger.debug('Payload recibido:', JSON.stringify(payload));
    
    // Verificar la estructura del payload
    if (!payload || !payload.data) {
      this.logger.error('Payload inválido:', payload);
      client.emit('locationError', {
        success: false,
        error: 'Estructura de payload inválida'
      });
      return;
    }

    try {
      const locationData = payload.data;
      this.logger.log(`Procesando ubicación: ${JSON.stringify(locationData)}`);
      
      const savedLocation = await this.locationService.saveLocation(locationData);
      
      this.logger.log(`Ubicación guardada: ${JSON.stringify(savedLocation)}`);
      
      client.emit('locationSaved', {
        success: true,
        data: savedLocation
      });

      return {
        event: 'locationUpdated',
        data: savedLocation
      };
    } catch (error) {
      this.logger.error(`Error al procesar ubicación: ${error.message}`);
      
      client.emit('locationError', {
        success: false,
        error: error.message
      });

      return {
        event: 'locationError',
        error: error.message
      };
    }
  }
}