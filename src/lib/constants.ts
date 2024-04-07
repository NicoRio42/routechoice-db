export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const SPLITTIMES_BASE_URL = 'https://splittimes.pages.dev';
export const SPLITTIMES_BASE_URL_DEV = 'http://localhost:5174';
export const ORIENTEERING_API_BASE_URL = 'https://orienteering-api.pages.dev';
export const TWO_D_RERUN_URL = 'http://loggator2.worldofo.com/loadwinsplits.php';
export const CLOUDINARY_CLOUD_NAME = 'dosqlwgkf';

export const GPS_PROVIDERS: Record<string, { urls: string[]; apiBaseUrl: string }> = {
	loggator: { urls: ['loggator.com', 'log.gl'], apiBaseUrl: 'http://events.loggator.com/api' },
	tractrac: { urls: ['tractrac.com'], apiBaseUrl: '' },
	'gps-seuranta': { urls: ['tulospalvelu.fi'], apiBaseUrl: '' }
} as const;
