import RunnerStatusEnum from "../../models/enums/runner-status-enum";
import type Runner from "../../models/Runner";
import { EMPTY_RUNNER_LEG, type RunnerLeg } from "../../models/runner-leg";
import { isRunner } from "../../type-guards/runner-guards";
import { extractNumberFromElementOrThrowError } from "../utils/xml-parser-utils";
import computeSplitsRanksMistakes from "./compute-splits-ranks-mistakes";
import { v4 as uuidv4 } from "uuid";

export function parseIOFXML3SplitTimesFile(
  xmlDocument: XMLDocument,
  className: string,
  timeZone: string,
  timeOffset: number
): Runner[] {
  const IOFXMLVersion = xmlDocument
    .querySelector("ResultList")
    ?.getAttribute("iofVersion");

  if (IOFXMLVersion !== "3.0") {
    throw new Error("Not an IOF XML 3.0 file");
  }

  const classResults = Array.from(xmlDocument.querySelectorAll("ClassResult"));

  const classResult = classResults.find((classR) => {
    const classTag = classR.querySelector("Class");
    const name = classTag?.querySelector("Name")?.textContent;

    return name === className;
  });

  if (classResult === undefined) {
    throw new Error("There is no ClassResult matching the given class name");
  }

  const personResults = classResult.querySelectorAll("PersonResult");
  const runners = getRunners(personResults, timeZone, timeOffset);

  return computeSplitsRanksMistakes(runners);
}

function getRunners(
  personResults: NodeListOf<Element>,
  timeZone: string,
  timeOffset: number
): Runner[] {
  const rawRunners: (Runner | null)[] = Array.from(personResults).map(
    (personResult) => {
      const statusTag = personResult.querySelector("Status");
      const IOFXMLStatus = statusTag !== null ? statusTag.textContent : null;

      // We skip runners with no split at all
      if (
        IOFXMLStatus === null ||
        !VALID_IOF_XML_STATUS.includes(IOFXMLStatus)
      ) {
        return null;
      }

      const status = OK_IOF_XML_STATUS.includes(IOFXMLStatus)
        ? RunnerStatusEnum.OK
        : RunnerStatusEnum.NOT_OK;

      const id = uuidv4();

      const family = personResult.querySelector("Family");
      const lastName = family !== null ? family.textContent : "";

      const given = personResult.querySelector("Given");
      const firstName = given !== null ? given.textContent : "";

      const startTimeTag = personResult.querySelector("StartTime");
      const startTime = computeStartTime(startTimeTag, timeZone, timeOffset);

      const timeTag = personResult.querySelector("Time");
      const time =
        status === RunnerStatusEnum.OK
          ? extractNumberFromElementOrThrowError(timeTag, "Not a valid time")
          : null;

      const legs: (RunnerLeg | null)[] =
        extractLegsFromPersonResult(personResult);

      if (legs.length === 0) return null;

      legs.push(computeLastLeg(time, legs));

      const foreignKeys: Record<string, unknown> = {};

      return {
        id,
        foreignKeys,
        status,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        startTime,
        time,
        legs,
        rank: null,
        timeBehind: null,
        totalTimeLost: 0,
        track: null,
      };
    }
  );

  const runners = rawRunners.filter(isRunner);

  if (runners.length === 0) {
    throw new Error("No valid runners in this file");
  }

  const firstRunnerLegsLenth = runners[0].legs.length;

  if (runners.some((runner) => runner.legs.length !== firstRunnerLegsLenth)) {
    throw new Error(
      "Not all runners have the same legs number in their course"
    );
  }

  return runners;
}

function computeLastLeg(time: number | null, legs: (RunnerLeg | null)[]) {
  const secondLastLeg = legs.at(-1);

  if (
    time == null ||
    secondLastLeg === null ||
    secondLastLeg?.timeOverall === undefined
  )
    return null;

  const startControlCode = secondLastLeg.finishControlCode;

  return {
    ...EMPTY_RUNNER_LEG,
    startControlCode,
    finishControlCode: "finish",
    timeOverall: time,
    time: time - secondLastLeg.timeOverall,
  };
}

function computeStartTime(
  startTimeTag: Element | null,
  timeZone: string,
  timeOffset: number
): number {
  if (startTimeTag === null || startTimeTag.textContent === null) {
    throw new Error("No start time with a valid runner status");
  }

  const time = startTimeTag.textContent.includes("+")
    ? startTimeTag.textContent
    : startTimeTag.textContent + timeZone;

  const dateTime = new Date(time);

  return dateTime.valueOf() / 1000 + timeOffset;
}

function extractLegsFromPersonResult(
  personResult: Element
): (RunnerLeg | null)[] {
  const legTags = Array.from(personResult.querySelectorAll("SplitTime"));

  return legTags.map((splitTime, index) => {
    const status = splitTime.getAttribute("status");

    if (
      status === IOFXMLSplitTimeStatusEnum.Additional.valueOf() ||
      status === IOFXMLSplitTimeStatusEnum.Missing.valueOf()
    ) {
      return null;
    }

    if (index > 0) {
      const previousControlStatus = legTags[index - 1].getAttribute("status");

      if (
        previousControlStatus ===
          IOFXMLSplitTimeStatusEnum.Additional.valueOf() ||
        previousControlStatus === IOFXMLSplitTimeStatusEnum.Missing.valueOf()
      ) {
        return null;
      }
    }

    const startControlCode = getStartControlCode(legTags, index);

    const controlCodeTag = splitTime.querySelector("ControlCode");

    if (controlCodeTag === null || controlCodeTag.textContent === null)
      throw new Error("No control code found for leg finish control");

    const finishControlCode = controlCodeTag.textContent;

    const timeTag = splitTime.querySelector("Time");

    const timeOverall = extractNumberFromElementOrThrowError(
      timeTag,
      "No valid split time"
    );

    const time = getTime(legTags, index, timeOverall);

    return {
      ...EMPTY_RUNNER_LEG,
      startControlCode,
      finishControlCode,
      timeOverall,
      time,
    };
  });
}

function getTime(
  legTags: Element[],
  index: number,
  timeOverall: number
): number {
  if (index === 0) return timeOverall;

  const previousControlTimeTag = legTags[index - 1].querySelector("Time");

  const previousControlTimeOverall = extractNumberFromElementOrThrowError(
    previousControlTimeTag,
    "No valid split time"
  );

  return timeOverall - previousControlTimeOverall;
}

function getStartControlCode(legTags: Element[], index: number): string {
  if (index === 0) return "start";

  const controlCodeTag = legTags[index - 1].querySelector("ControlCode");

  if (controlCodeTag === null || controlCodeTag.textContent === null)
    throw new Error("Previous control sould exist");

  return controlCodeTag.textContent;
}

enum IOFXML3RunnerStatusEnum {
  OK = "OK",
  Finished = "Finished",
  MissingPunch = "MissingPunch",
  Disqualified = "Disqualified",
  DidNotFinish = "DidNotFinish",
  Active = "Active",
  Inactive = "Inactive",
  OverTime = "OverTime",
  SportingWithdrawal = "SportingWithdrawal",
  NotCompeting = "NotCompeting",
  Moved = "Moved",
  MovedUp = "MovedUp",
  DidNotStart = "DidNotStart",
  DidNotEnter = "DidNotEnter",
  Cancelled = "Cancelled",
}

enum IOFXMLSplitTimeStatusEnum {
  Missing = "Missing",
  Additional = "Additional",
}

const OK_IOF_XML_STATUS = [
  IOFXML3RunnerStatusEnum.OK.valueOf(),
  IOFXML3RunnerStatusEnum.Finished.valueOf(),
];

const VALID_IOF_XML_STATUS = [
  IOFXML3RunnerStatusEnum.OK.valueOf(),
  IOFXML3RunnerStatusEnum.Finished.valueOf(),
  IOFXML3RunnerStatusEnum.MissingPunch.valueOf(),
  IOFXML3RunnerStatusEnum.Disqualified.valueOf(),
  IOFXML3RunnerStatusEnum.DidNotFinish.valueOf(),
  IOFXML3RunnerStatusEnum.OverTime.valueOf(),
];
