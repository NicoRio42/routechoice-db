import { browser } from '$app/environment';
import { CLOUDINARY_CLOUD_NAME } from '$lib/constants.js';
import { mapIsLoading } from '$lib/stores/map-loading.store';
import type { CourseMap, MapCalibration } from 'orienteering-js/models';

export const cachedImages: Record<string, HTMLImageElement> = {};
const IOS_CANVAS_MAX_PIXELS = 16777216;

type CalibrationWidthHeight = { calibration: MapCalibration; width: number; height: number };

export async function getMapCallibrationByFetchingMapImageIfNeeded(
	courseMap: CourseMap
): Promise<CalibrationWidthHeight> {
	if (!browser) {
		throw new Error('This function is not inteded to run on the server');
	}

	const isLoggatorIncompleteMapCallibration = courseMap.calibration.some(
		(cal) => cal.point.x === -1 || cal.point.y === -1
	);

	return new Promise<CalibrationWidthHeight>((resolve, reject) => {
		const image = new Image();

		image.onload = () => {
			if (isIphone() && imageIsTooLargeForIphoneCanvas(image)) {
				// Resize image for iphones
				const [width, height] = computeResizedWidthHeight(image.naturalWidth, image.naturalHeight);

				const resizedImage = new Image();
				resizedImage.crossOrigin = 'Anonymous';
				resizedImage.onerror = () => reject('Failed to load map image');
				resizedImage.src = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/c_scale,w_${width}/${image.src}`;
				cachedImages[courseMap.url] = resizedImage;

				mapIsLoading.set(false);

				resolve({
					calibration: isLoggatorIncompleteMapCallibration
						? [
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
									point: { x: 1, y: height }
								},
								{
									gps: {
										lat: courseMap.calibration[2].gps.lat,
										lon: courseMap.calibration[2].gps.lon
									},
									point: { x: width, y: 1 }
								}
							]
						: courseMap.calibration,
					width,
					height
				});

				return;
			}

			mapIsLoading.set(false);

			resolve({
				calibration: isLoggatorIncompleteMapCallibration
					? [
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
						]
					: courseMap.calibration,
				width: image.naturalWidth,
				height: image.naturalHeight
			});
		};

		image.onerror = () => reject('Failed to load map image');
		image.src = getImageSrc(courseMap.url);

		cachedImages[courseMap.url] = image;
	});
}

function getImageSrc(imageUrl: string) {
	if (import.meta.env.MODE === 'dev-offline') {
		return 'http://localhost:5173/tile_0_0.jpg';
	}

	return imageUrl;
}

function isIphone() {
	return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function imageIsTooLargeForIphoneCanvas(img: HTMLImageElement) {
	return img.naturalWidth * img.naturalHeight >= IOS_CANVAS_MAX_PIXELS;
}

function computeResizedWidthHeight(imageWidth: number, imageHeight: number): [number, number] {
	const newWidth = Math.sqrt((imageWidth * IOS_CANVAS_MAX_PIXELS) / imageHeight);
	const newHeight = IOS_CANVAS_MAX_PIXELS / newWidth;

	return [Math.floor(newWidth), Math.floor(newHeight)];
}
