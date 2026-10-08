import type { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/** Express request after JwtStrategy.validate() has populated `user`. */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
