interface Runner {
	id: string;
	firstName: string;
	lastName: string;
	userId: string | null;
	trackingDeviceId: string | null;
}

export interface RunnerForMatching {
	name: string;
	key: string;
}

export function matchRunnersByName(
	runners: Runner[],
	key: 'userId' | 'trackingDeviceId',
	runnersForMatching: RunnerForMatching[]
): Runner[] {
	const clonedRunners = structuredClone(runners) as Runner[];

	const standardizedRunnersForMatching: {
		name: string[];
		key: string;
	}[] = runnersForMatching.map((r) => ({
		...r,
		name: replaceAll(r.name, /\s\s+/g, ' ')
			.split(' ')
			.flatMap((nameFragment) => nameFragment.split('-'))
			.filter((nameFragment) => !nameFragment.startsWith('#') && isNaN(parseInt(nameFragment)))
			.map(trimToLowerCaseRemoveAccents)
	}));

	clonedRunners.forEach((runner) => {
		const standardizedRunnerName = [runner.firstName, runner.lastName]
			.flatMap((name) => replaceAll(name, /\s\s+/g, ' ').split(' '))
			.flatMap((name) => name.split('-'))
			.filter((nameFragment) => !nameFragment.startsWith('#') && isNaN(parseInt(nameFragment)))
			.map(trimToLowerCaseRemoveAccents);

		for (const runnerForMatching of standardizedRunnersForMatching) {
			if (runnerForMatching.name.length !== standardizedRunnerName.length) continue;

			// Full match
			if (runnerForMatching.name.every((namePart) => standardizedRunnerName.includes(namePart))) {
				runner[key] = runnerForMatching.key;
				break;
			}

			const routeNumberOfInitiuals = getNumberOfInitials(runnerForMatching.name);
			const runnerNumberOfInitiuals = getNumberOfInitials(standardizedRunnerName);

			if (
				!(
					(runnerNumberOfInitiuals === 1 && routeNumberOfInitiuals === 0) ||
					(runnerNumberOfInitiuals === 0 && routeNumberOfInitiuals === 1)
				)
			) {
				continue;
			}

			if (runnerNumberOfInitiuals === 1) {
				const initialIndex = standardizedRunnerName.findIndex((name) => name.length === 1);

				const matchIndexes: number[] = [];

				const allNamesExceptInitialMatch = standardizedRunnerName.every((name, index) => {
					if (index === initialIndex) return true;
					const i = runnerForMatching.name.findIndex((n) => n === name);
					if (i !== -1) matchIndexes.push(i);
					return i !== -1;
				});

				const initialMatch = runnerForMatching.name.every(
					(name, index) =>
						matchIndexes.includes(index) || name.startsWith(standardizedRunnerName[initialIndex])
				);

				if (allNamesExceptInitialMatch && initialMatch) {
					runner[key] = runnerForMatching.key;
					break;
				}
			}

			if (routeNumberOfInitiuals === 1) {
				const initialIndex = runnerForMatching.name.findIndex((name) => name.length === 1);

				const matchIndexes: number[] = [];

				const allNamesExceptInitialMatch = runnerForMatching.name.every((name, index) => {
					if (index === initialIndex) return true;
					const i = standardizedRunnerName.findIndex((n) => n === name);
					if (i !== -1) matchIndexes.push(i);
					return i !== -1;
				});

				const initialMatch = standardizedRunnerName.every(
					(name, index) =>
						matchIndexes.includes(index) || name.startsWith(runnerForMatching.name[initialIndex])
				);

				if (allNamesExceptInitialMatch && initialMatch) {
					runner[key] = runnerForMatching.key;
				}
			}
		}
	});

	return clonedRunners;
}

function getNumberOfInitials(name: string[]): number {
	return name.reduce((previous, current) => (current.length === 1 ? previous + 1 : previous), 0);
}

function trimToLowerCaseRemoveAccents(str: string): string {
	str = str.toLowerCase().trim();

	accentsMap.forEach((letter) =>
		letter[1].forEach((accent) => (str = replaceAll(str, accent, letter[0])))
	);

	return str;
}

function replaceAll(
	str: string,
	stringToBeReplaced: string | RegExp,
	stringToReaplace: string
): string {
	if (typeof stringToBeReplaced === 'string') {
		while (str.includes(stringToBeReplaced)) {
			str = str.replace(stringToBeReplaced, stringToReaplace);
		}

		return str;
	}

	while (stringToBeReplaced.test(str)) {
		str = str.replace(stringToBeReplaced, stringToReaplace);
	}

	return str;
}

const accentsMap: [string, string[]][] = [
	['a', ['á', 'à', 'ã', 'â', 'ä', 'å', 'æ']],
	['e', ['é', 'è', 'ê', 'ë']],
	['i', ['í', 'ì', 'î', 'ï']],
	['o', ['ó', 'ò', 'ô', 'õ', 'ö', 'ø']],
	['u', ['ú', 'ù', 'û', 'ü']],
	['c', ['ç']],
	['n', ['ñ']]
];
