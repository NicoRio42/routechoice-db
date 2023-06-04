import { z } from 'zod';

export const RolesEnum = z.enum(['default', 'admin']);
