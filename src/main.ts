import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    );

    app.enableCors({
        origin: '*', // '*'로 모든 도메인 허용 (보안이 중요하면 특정 도메인만 허용)
        methods: '*',
        allowedHeaders: '*'
    });

    app.useWebSocketAdapter(new IoAdapter(app));

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
