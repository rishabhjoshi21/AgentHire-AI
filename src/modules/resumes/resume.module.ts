import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { ResumeRepository } from './resume.repository';
import { ResumeParser } from './parsers/resume.parser';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [ResumeController],

  providers: [ResumeService, ResumeRepository, ResumeParser],
})
export class ResumeModule {}
