import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { JobDescriptionController } from './job-description.controller';
import { JobDescriptionService } from './job-description.service';
import { JobDescriptionRepository } from './job-description.repository';

@Module({
  imports: [AuthModule],

  controllers: [JobDescriptionController],

  providers: [JobDescriptionService, JobDescriptionRepository],
  exports: [JobDescriptionService, JobDescriptionRepository],
})
export class JobDescriptionModule {}
