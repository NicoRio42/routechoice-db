import { z } from 'zod';

export const RunnerStatusEnum = z.enum(['ok', 'not-ok']);
