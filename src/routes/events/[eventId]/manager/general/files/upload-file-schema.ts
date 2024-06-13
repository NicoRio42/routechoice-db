import { MAX_R2_SIZE } from '$lib/constants';
import { z } from 'zod';

const MAX_FILENAME_LENGTH = 20;

export const uploadFileSchema = z.object({
	name: z
		.string()
		.min(1, 'The file name is mandatory')
		.max(MAX_FILENAME_LENGTH, `File name should not exceed ${MAX_FILENAME_LENGTH} characters`),
	file: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < MAX_R2_SIZE, 'Max 10 MB upload size.')
		.refine((f) => !f.name.includes('/'), 'File name should not include slashes.')
});
