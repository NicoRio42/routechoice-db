/**
 * @param seconds Time in seconds
 * @returns Time string in HH:MM:SS format
 */
export function secondsToPrettyTime(seconds: number) {
	const hours = Math.trunc(seconds / 3600);
	let remainingSeconds = seconds % 3600;
	const minutes = Math.trunc(remainingSeconds / 60);
	remainingSeconds = remainingSeconds % 60;

	if (hours === 0 && minutes === 0) {
		return String(remainingSeconds);
	} else if (hours === 0) {
		if (remainingSeconds < 10) {
			return String(minutes) + ':0' + String(remainingSeconds);
		} else {
			return String(minutes) + ':' + String(remainingSeconds);
		}
	} else if (minutes < 10) {
		return String(hours) + ':0' + String(minutes) + ':' + String(remainingSeconds);
	}
	return String(hours) + ':' + String(minutes) + ':' + String(remainingSeconds);
}

export function fullNameToShortName(firstName: string, lastName: string) {
	if (firstName.length === 0) return lastName;

	return `${firstName.charAt(0)}. ${lastName}`;
}

export function rankToCSSClass(rank: number): string {
	if (rank === 1) {
		return 'first';
	} else if (rank === 2) {
		return 'second';
	} else if (rank === 3) {
		return 'third';
	}

	return '';
}
