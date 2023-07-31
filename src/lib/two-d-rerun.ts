import { CoordinatesConverter } from 'orienteering-js/map';
import type { MapCalibration, TwoDRerunCourseExport } from 'orienteering-js/models';

function parseFloatOrThrow(str: string): number {
	const parsedNum = parseFloat(str);
	if (isNaN(parsedNum)) throw new Error('Not a number');
	return parsedNum;
}

type MapCalibrationPoint = MapCalibration[0];

// Todo: move that to orienteering-js when version 0.23 is push from peronnal computer
export function getCoordinatesConverterFromTwoDRerunCourseExport(
	twoDRerunExport: TwoDRerunCourseExport
): CoordinatesConverter {
	const allPoints: MapCalibrationPoint[] = twoDRerunExport.tags.flatMap((tag) =>
		tag.points.map((point, pointIndex) => {
			const [lat, lon] = point.split(',').map(parseFloatOrThrow);
			const [x, y] = tag.pointsxy[pointIndex].split(',').map(parseFloatOrThrow);
			return { gps: { lat, lon }, point: { x, y } };
		})
	);

	let top = allPoints[0];
	let bottom = allPoints[0];
	let left = allPoints[0];

	for (const point of allPoints) {
		if (point.point.y < top.point.y) {
			top = point;
			continue;
		}
		if (point.point.y > top.point.y) {
			bottom = point;
			continue;
		}
		if (point.point.x < top.point.x) {
			left = point;
			continue;
		}
	}

	if (top.point.x === bottom.point.x && top.point.y === bottom.point.y) {
		throw new Error('Top and bottom are the same point');
	}
	if (top.point.x === left.point.x && top.point.y === left.point.y) {
		throw new Error('Top and left are the same point');
	}
	if (left.point.x === bottom.point.x && left.point.y === bottom.point.y) {
		throw new Error('Left and bottom are the same point');
	}

	return new CoordinatesConverter([top, left, bottom]);
}
