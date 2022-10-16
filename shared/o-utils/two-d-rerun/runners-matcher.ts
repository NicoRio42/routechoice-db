import type { TwoDRerunRoute } from "../models/2d-rerun/mapviewer";
import type Runner from "../models/runner";

export function attribute2DRerunTrackToMatchedRunner(
  runners: Runner[],
  twoDRerunRoutes: TwoDRerunRoute[]
): Runner[] {
  return structuredClone(runners).map((runner) => {
    const route = twoDRerunRoutes.find(
      (r) => r.indexnumber === runner.foreignKeys.twoDRerunRouteIndexNumber
    );

    return {
      ...runner,
      track:
        route === undefined
          ? null
          : {
              lats: route.latarray,
              lons: route.lngarray,
              times: route.timearray,
            },
    };
  });
}

export function matchRunnersByName(
  runners: Runner[],
  twoDRerunRoutes: TwoDRerunRoute[]
): Runner[] {
  const clonedRunners = structuredClone(runners);

  const standardized2DRerunRoutesNames: {
    name: string[];
    indexnumber: number;
  }[] = twoDRerunRoutes.map((route) => ({
    name: replaceAll(route.runnername, /\s\s+/g, " ")
      .split(" ")
      .map(trimToLowerCaseRemoveAccents),
    indexnumber: route.indexnumber,
  }));

  clonedRunners.forEach((runner) => {
    const standardizedRunnerName = [runner.firstName, runner.lastName]
      .flatMap((name) => replaceAll(name, /\s\s+/g, " ").split(" "))
      .map(trimToLowerCaseRemoveAccents);

    for (const route of standardized2DRerunRoutesNames) {
      if (route.name.length !== standardizedRunnerName.length) continue;

      // Full match
      if (
        route.name.every((namePart) =>
          standardizedRunnerName.includes(namePart)
        )
      ) {
        runner.foreignKeys.twoDRerunRouteIndexNumber = route.indexnumber;
        break;
      }

      const routeNumberOfInitiuals = getNumberOfInitiuals(route.name);
      const runnerNumberOfInitiuals = getNumberOfInitiuals(
        standardizedRunnerName
      );

      if (
        !(
          (runnerNumberOfInitiuals === 1 && routeNumberOfInitiuals === 0) ||
          (runnerNumberOfInitiuals === 0 && routeNumberOfInitiuals === 1)
        )
      ) {
        continue;
      }

      if (runnerNumberOfInitiuals === 1) {
        const initialIndex = standardizedRunnerName.findIndex(
          (name) => name.length === 1
        );

        const matchIndexes: number[] = [];

        const allNamesExceptInitialMatch = standardizedRunnerName.every(
          (name, index) => {
            if (index === initialIndex) return true;
            const i = route.name.findIndex((n) => n === name);
            if (i !== -1) matchIndexes.push(i);
            return i !== -1;
          }
        );

        const initialMatch = route.name.every(
          (name, index) =>
            matchIndexes.includes(index) ||
            name.startsWith(standardizedRunnerName[initialIndex])
        );

        if (allNamesExceptInitialMatch && initialMatch) {
          runner.foreignKeys.twoDRerunRouteIndexNumber = route.indexnumber;
          break;
        }
      }

      if (routeNumberOfInitiuals === 1) {
        const initialIndex = route.name.findIndex((name) => name.length === 1);

        const matchIndexes: number[] = [];

        const allNamesExceptInitialMatch = route.name.every((name, index) => {
          if (index === initialIndex) return true;
          const i = standardizedRunnerName.findIndex((n) => n === name);
          if (i !== -1) matchIndexes.push(i);
          return i !== -1;
        });

        const initialMatch = standardizedRunnerName.every(
          (name, index) =>
            matchIndexes.includes(index) ||
            name.startsWith(route.name[initialIndex])
        );

        if (allNamesExceptInitialMatch && initialMatch) {
          runner.foreignKeys.twoDRerunRouteIndexNumber = route.indexnumber;
          break;
        }
      }
    }
  });

  return clonedRunners;
}

function getNumberOfInitiuals(name: string[]): number {
  return name.reduce(
    (previous, current) => (current.length === 1 ? previous + 1 : previous),
    0
  );
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
  if (typeof stringToBeReplaced === "string") {
    while (str.includes(stringToBeReplaced)) {
      str.replace(stringToBeReplaced, stringToReaplace);
    }

    return str;
  }

  while (stringToBeReplaced.test(str)) {
    str.replace(stringToBeReplaced, stringToReaplace);
  }

  return str;
}

const accentsMap: [string, string[]][] = [
  ["a", ["á", "à", "ã", "â", "ä", "å", "æ"]],
  ["e", ["é", "è", "ê", "ë"]],
  ["i", ["í", "ì", "î", "ï"]],
  ["o", ["ó", "ò", "ô", "õ", "ö", "ø"]],
  ["u", ["ú", "ù", "û", "ü"]],
  ["c", ["ç"]],
  ["n", ["ñ"]],
];
