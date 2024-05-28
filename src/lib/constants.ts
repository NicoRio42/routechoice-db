export const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const SPLITTIMES_BASE_URL = 'https://splittimes.pages.dev';
export const SPLITTIMES_BASE_URL_DEV = 'http://localhost:5174';
export const ORIENTEERING_API_BASE_URL = 'https://orienteering-api.pages.dev';
export const TWO_D_RERUN_URL = 'http://loggator2.worldofo.com/loadwinsplits.php';
export const CLOUDINARY_CLOUD_NAME = 'dosqlwgkf';

type GpsProvider = {
	urls: string[];
	apiBaseUrl: string;
	getEventDataUrl: (eventId: string) => string;
	getEventPointsUrl: (eventId: string) => string;
};

export const GPS_PROVIDERS: Record<string, GpsProvider> = {
	loggator: {
		urls: ['loggator.com', 'log.gl'],
		apiBaseUrl: 'https://events.loggator.com/api',
		getEventDataUrl: (eventId) => `https://events.loggator.com/api/events/${eventId}`,
		getEventPointsUrl: (eventId) => `https://events.loggator.com/api/events/${eventId}/points.json`
	},
	'gps-seuranta': {
		urls: ['tulospalvelu.fi'],
		apiBaseUrl: 'https://www.tulospalvelu.fi/gps',
		getEventDataUrl: (eventId) => `https://www.tulospalvelu.fi/gps/${eventId}/init.txt`,
		getEventPointsUrl: (eventId) => `https://www.tulospalvelu.fi/gps/${eventId}/data.lst`
	}
} as const;
