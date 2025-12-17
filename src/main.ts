import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('ClaimFlow API')
    .setDescription('API para gestión de reclamos - Sistema integral de manejo de solicitudes y seguimiento')
    .setVersion('1.0')
    .addTag('reclamo', 'Gestión de reclamos')
    .addTag('solicitud-reclamo', 'Solicitudes de reclamo (clientes)')
    .addTag('estado-reclamo', 'Estados de los reclamos')
    .addTag('tipo-reclamo', 'Tipos de reclamos')
    .addTag('area', 'Áreas de responsabilidad')
    .addTag('cliente', 'Gestión de clientes')
    .addTag('proyecto', 'Gestión de proyectos')
    .addTag('archivo', 'Gestión de archivos/evidencias')
    .addTag('mensaje', 'Sistema de mensajería interna')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'ClaimFlow API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.enableCors();

  console.log('🚀 ClaimFlow API is running');
  console.log(`📚 Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
