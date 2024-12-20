import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Configuración de CORS para producción
  app.enableCors({
    origin: '*', // En producción, especifica los dominios permitidos
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  });
  
  // Configuración del WebSocket
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);
  
  // Usar el puerto de Render o el puerto por defecto
  const port = process.env.PORT || 3005;
  
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Aplicación corriendo en puerto: ${port}`);
  logger.log('📡 WebSocket escuchando en namespace: /location');
}
bootstrap();
