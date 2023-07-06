import { browser } from '$app/environment';
import type { CourseMap, MapCalibration } from 'orienteering-js/models';

export const cachedImages: Record<string, HTMLImageElement> = {};

export async function getMapCallibrationByFetchingMapImageIfNeeded(
	courseMap: CourseMap
): Promise<MapCalibration> {
	if (!browser) {
		throw new Error('This function is not inteded to run on the server');
	}

	const isNeededToFetchMapImage = courseMap.calibration.some(
		(cal) => cal.point.x === -1 || cal.point.y === -1
	);

	if (!isNeededToFetchMapImage) return Promise.resolve(courseMap.calibration);

	return new Promise<MapCalibration>((resolve, reject) => {
		const image = new Image();

		image.onload = () => {
			resolve([
				{
					gps: {
						lat: courseMap.calibration[0].gps.lat,
						lon: courseMap.calibration[0].gps.lon
					},
					point: { x: 1, y: 1 }
				},
				{
					gps: {
						lat: courseMap.calibration[1].gps.lat,
						lon: courseMap.calibration[1].gps.lon
					},
					point: { x: 1, y: image.naturalHeight }
				},
				{
					gps: {
						lat: courseMap.calibration[2].gps.lat,
						lon: courseMap.calibration[2].gps.lon
					},
					point: { x: image.naturalWidth, y: 1 }
				}
			]);
		};

		image.onerror = () => reject('Failed to load map image');
		// image.src = courseMap.url;
		image.src = 'http://localhost:5173/tile_0_0.jpg';

		cachedImages[courseMap.url] = image;
	});
}
