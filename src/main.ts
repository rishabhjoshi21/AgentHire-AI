import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { envSchema } from './shared/config/env.config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
async function bootstrap() {
  config();
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables');
    console.error(result.error.format());
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  await app.listen(result.data.PORT ?? 3000);
  console.log(`🚀 AgentHire running on port ${result.data.PORT}`);
}
bootstrap().catch((error) => {
  console.error('❌ Failed to start the application');
  console.error(error);
  process.exit(1);
});
