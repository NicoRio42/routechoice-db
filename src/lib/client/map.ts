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

		image.src =
			import.meta.env.MODE === 'dev-offline' ? 'http://localhost:5173/tile_0_0.jpg' : courseMap.url;

		cachedImages[courseMap.url] = image;
	});
}

export async function resizeImageIfNedded(src: string) {
	return new Promise<string>((resolve, reject) => {
		const canvas2 = document.createElement('canvas');
		const gl = canvas2.getContext('webgl');
		const maxTextureSize: number | null = gl !== null ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null;

		const img = new Image();
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		img.onload = () => {
			if (ctx === null) {
				reject();
				return;
			}

			const [width, height] =
				maxTextureSize === null
					? [img.width, img.height]
					: computeResizedWidthHeight(img.width, img.height, maxTextureSize);

			console.log([width, height]);
			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL());
		};

		img.src = src;
	});
}

function computeResizedWidthHeight(
	imageWidth: number,
	imageHeight: number,
	maxTextureSize: number
): [number, number] {
	if (imageWidth <= maxTextureSize && imageHeight <= maxTextureSize) {
		return [imageWidth, imageHeight];
	}

	if (imageWidth > maxTextureSize && imageHeight > maxTextureSize) {
		if (imageWidth > imageHeight) {
			return [maxTextureSize, (maxTextureSize * imageHeight) / imageWidth];
		} else {
			return [(maxTextureSize * imageWidth) / imageHeight, maxTextureSize];
		}
	}

	if (imageWidth > maxTextureSize) {
		return [maxTextureSize, (maxTextureSize * imageHeight) / imageWidth];
	}

	// if imageHeight > maxTextureSize
	return [(maxTextureSize * imageWidth) / imageHeight, maxTextureSize];
}
