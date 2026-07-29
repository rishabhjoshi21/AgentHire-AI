import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import {
  databaseConfig,
  redisConfig,
  jwtConfig,
  appConfig,
} from './shared/config';
import { ResumeModule } from './modules/resumes/resume.module';
import { JobDescriptionModule } from './modules/job-description/job-description.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ResumeReviewModule } from './modules/resume-review/resume-review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [appConfig, appConfig, databaseConfig, jwtConfig, redisConfig],
    }),
    PrismaModule,
    AuthModule,
    ResumeModule,
    JobDescriptionModule,
    AnalysisModule,
    ResumeReviewModule,
  ],
})
export class AppModule {}
