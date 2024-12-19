import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 3005;
  
  await app.listen(3005);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log('WebSocket server is listening on namespace: /location');
}
bootstrap();