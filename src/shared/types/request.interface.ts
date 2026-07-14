import type { Request } from 'express';

import type { JwtPayload } from '@/modules/auth/auth.dto';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
