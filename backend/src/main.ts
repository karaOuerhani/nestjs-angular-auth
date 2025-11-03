import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentation de l\'API. <br><a href="/api-json" target="_blank" style="color:#1976d2;text-decoration:underline;">Voir le Swagger JSON</a>')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
