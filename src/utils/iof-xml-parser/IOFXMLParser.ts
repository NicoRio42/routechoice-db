import { RouteChoicesStatistic } from "../../models/route-choices-statistics";
import { Routechoice } from "../../models/routechoice";
import type { Runner } from "../../models/runner";

const MISTAKE_DETECTION_RATIO = 1.2;

export class IOFXMLParser {
  splitsXmlDoc: XMLDocument;
  className: string;
  mistakeDetectionRatio: number;
  date: Date;
  timeZone: string;
  course: number[] = [];
  runners: Runner[] = [];
  leader: number[] = [];
  superman: number[] = [];
  supermanSplits: number[] = [];
  mistakesSum: number[] = [];
  timeOffset = 0;
  routeChoicesStatistics: Record<string, RouteChoicesStatistic>[] = [];

  constructor(
    splitsXmlDoc: XMLDocument,
    className: string,
    mistakeDetectionRatio = MISTAKE_DETECTION_RATIO,
    timeZone: string,
    timeOffset?: number,
    date?: Date
  ) {
    this.splitsXmlDoc = splitsXmlDoc;
    this.className = className;
    this.mistakeDetectionRatio = mistakeDetectionRatio;
    this.date = date;
    this.timeZone = timeZone;
    this.timeOffset = timeOffset;

    this.loadSplits();
  }

  computeRoutechoicesStatistics(): void {
    this.course.forEach((leg, legIndex) => {
      const legStatistics: Record<string, RouteChoicesStatistic> = {};

      // Make an array with splits and id for one leg
      const legSplits: RunnerForSort[] = this.runners
        .map((runner) => {
          const lg = runner.legs[legIndex];
          return { id: runner.id, time: lg.time, routeChoice: lg.routeChoice };
        })
        .filter((runner) => runner.routeChoice);

      legSplits.sort((a, b) => this.sortRunners(a, b));

      if (legSplits.length !== 0) {
        const firstQuartileIndex = Math.round(legSplits.length / 4) - 1;

        legSplits.forEach((runner, runnerIndex) => {
          legStatistics[runner.routeChoice.name] = legStatistics[
            runner.routeChoice.name
          ] ?? { numberOfRunners: 0 };

          legStatistics[runner.routeChoice.name].fastestTime =
            legStatistics[runner.routeChoice.name].fastestTime ?? runner.time;

          // legStatistics[runner.routeChoice.name].firstQuartileTime =
          //   runnerIndex === firstQuartileIndex
          //     ? runner.time
          //     : legStatistics[runner.routeChoice.name].firstQuartileTime;

          legStatistics[runner.routeChoice.name].numberOfRunners += 1;
          legStatistics[runner.routeChoice.name].color =
            runner.routeChoice.color;
        });
      }

      this.routeChoicesStatistics.push(legStatistics);
    });

    console.log(this.routeChoicesStatistics);
  }

  private loadSplits(): void {
    this.loadSplitsFromXml();
    this.checkIfCourseIsComplete();
    this.calculateRanks();
    this.calculateSplitTimes();
    this.calculateSplitRanksAndTimeBehind();
    this.calculateOverallRanks();
    this.calculateMistakes();
  }

  private loadSplitsFromXml(): void {
    const classResults = Array.from(
      this.splitsXmlDoc.querySelectorAll("ClassResult")
    );
    const IOFXMLVersion = this.splitsXmlDoc
      .querySelector("ResultList")
      .getAttribute("iofVersion");

    // Find classResult by className
    const classResult = classResults.filter((classR) => {
      const name =
        IOFXMLVersion === "3.0"
          ? classR.querySelector("Class Name").innerHTML
          : classR.querySelector("ClassShortName").innerHTML;
      return name === this.className;
    });

    const personResults = classResult[0].querySelectorAll("PersonResult");
    personResults.forEach((personResult, index) => {
      const id = index + 1;
      const familyName = personResult.querySelector("Family")
        ? personResult.querySelector("Family").innerHTML
        : "";
      const firstName = personResult.querySelector("Given").innerHTML;
      let time = null;
      let startTime = null;
      let status = null;

      if (personResult.querySelector("StartTime")) {
        if (IOFXMLVersion === "3.0") {
          startTime =
            personResult.querySelector("StartTime").innerHTML + this.timeZone;
          status = personResult.querySelector("Status").innerHTML;
          if (status) {
            time = Number(personResult.querySelector("Time").innerHTML);
          }
        } else {
          startTime =
            this.date +
            "T" +
            personResult.querySelector("StartTime").innerHTML +
            this.timeZone;
          status = personResult
            .querySelector("CompetitorStatus")
            .getAttribute("value");
          if (status) {
            time = this.timeToSeconds(
              personResult.querySelector("Time").innerHTML
            ); // TODO
          }
        }
      }

      const runnerCourse = Array.from(
        personResult.querySelectorAll("ControlCode")
      ).map((controlCode) => Number(controlCode.innerHTML));
      const legs = Array.from(personResult.querySelectorAll("SplitTime")).map(
        (splitTime) => {
          const controlCode = Number(
            splitTime.querySelector("ControlCode").innerHTML
          );
          const t = splitTime.querySelector("Time");
          let timeOverall: number;
          if (t) {
            if (IOFXMLVersion === "3.0") {
              timeOverall = Number(t.innerHTML);
            } else {
              timeOverall = this.timeToSeconds(t.innerHTML);
            }
          } else {
            timeOverall = null;
          }
          return { controlCode: controlCode, timeOverall: timeOverall };
        }
      );

      // Add split for finish
      legs.push({ controlCode: 999, timeOverall: time });
      runnerCourse.push(999);

      this.runners.push({
        id: id,
        course: runnerCourse,
        status: status,
        firstName: firstName,
        lastName: familyName,
        startTime: startTime,
        time: time,
        legs: legs,
        timeBehindSupermanGraphData: [],
        timeBehindLeaderGraphData: [],
      });
    });

    // Set reference course to first runner's course
    this.course = this.runners[0].course;
  }

  private checkIfCourseIsComplete(): void {
    // Check if there is a SplitTime tag for every controls
    // Possible that there is no Time attached though
    this.runners.forEach((runner) => {
      if (this.arrayEquals(runner.course, this.course)) {
        runner.isComplete = true;
      } else {
        runner.isComplete = false;
      }
    });
    // For now only complete courses are keeped
    this.runners = this.runners.filter((runner) => runner.isComplete === true);
  }

  private calculateRanks(): void {
    this.runners.sort((a, b) => this.sortRunners(a, b));
    const splitsLength = this.runners.length;
    const bestTime = this.runners[0].time;

    for (let i = 0; i < splitsLength; i++) {
      if (i > 0 && this.runners[i].time !== null) {
        if (this.runners[i].time === this.runners[i - 1].time) {
          this.runners[i].rank = this.runners[i - 1].rank;
        } else {
          this.runners[i].rank = i + 1;
        }
        this.runners[i].timeBehind = this.runners[i].time - bestTime;
      } else if (this.runners[i].time !== null) {
        this.runners[i].rank = i + 1;
        this.runners[i].timeBehind = this.runners[i].time - bestTime;
      }
    }
  }

  private calculateSplitTimes(): void {
    this.runners.forEach((runner) => {
      runner.legs.forEach((leg, index) => {
        if (index === 0) {
          if (leg.timeOverall === null) {
            leg.time = null;
          } else {
            leg.time = leg.timeOverall;
          }
        } else {
          if (leg.timeOverall === null) {
            leg.time = null;
          } else if (runner.legs[index - 1].timeOverall === null) {
            leg.time = null;
          } else {
            leg.time = leg.timeOverall - runner.legs[index - 1].timeOverall;
          }
        }
      });
    });
  }

  private calculateSplitRanksAndTimeBehind(): void {
    // For every legs of every runners calculate ranking and time behind
    this.course.forEach((leg, index) => {
      // Make an array with splits and id for one leg
      const legSplits: RunnerForSort[] = this.runners.map((runner) => {
        const lg = runner.legs.find((l) => l.controlCode === leg);
        return { id: runner.id, time: lg.time };
      });

      legSplits.sort((a, b) => this.sortRunners(a, b));

      // Populate the superman array
      if (index === 0) {
        this.superman.push(legSplits[0].time);
      } else {
        this.superman.push(this.superman[index - 1] + legSplits[0].time);
      }

      this.supermanSplits.push(legSplits[0].time);

      legSplits.forEach((legSplit, i) => {
        //manage equal ranks
        if (i > 0) {
          if (legSplit.time === legSplits[i - 1].time) {
            legSplit.rankSplit = legSplits[i - 1].rankSplit;
          } else {
            legSplit.rankSplit = i + 1;
          }
        } else {
          legSplit.rankSplit = i + 1;
        }
        const runnerIndex = this.runners.findIndex((r) => legSplit.id === r.id);
        this.runners[runnerIndex].legs[index].rankSplit = legSplit.rankSplit;
        if (this.runners[runnerIndex].legs[index].time === null) {
          this.runners[runnerIndex].legs[index].timeBehindSplit = null;
        } else {
          this.runners[runnerIndex].legs[index].timeBehindSplit =
            this.runners[runnerIndex].legs[index].time - legSplits[0].time;
        }
      });
    });
  }

  private calculateOverallRanks(): void {
    // For every legs of every runners calculate ranking and time behind
    this.course.forEach((leg, index) => {
      // Make an array with overall times and id for one leg
      const legOverallTimes: RunnerForSort[] = this.runners.map((runner) => {
        const lg = runner.legs.find((l) => l.controlCode === leg);
        return { id: runner.id, time: lg.timeOverall };
      });

      legOverallTimes.sort((a, b) => this.sortRunners(a, b));

      this.leader.push(legOverallTimes[0].time);

      legOverallTimes.forEach((legOverallTime, i) => {
        //manage equal ranks
        if (i > 0) {
          if (legOverallTime.time === legOverallTimes[i - 1].time) {
            legOverallTime.rankSplit = legOverallTimes[i - 1].rankSplit;
          } else {
            legOverallTime.rankSplit = i + 1;
          }
        } else {
          legOverallTime.rankSplit = i + 1;
        }

        const runnerIndex = this.runners.findIndex(
          (r) => legOverallTime.id === r.id
        );
        this.runners[runnerIndex].legs[index].rankOverall =
          legOverallTime.rankSplit;

        if (this.runners[runnerIndex].legs[index].timeOverall === null) {
          this.runners[runnerIndex].legs[index].timeBehindOverall = null;
          this.runners[runnerIndex].legs[index].timeBehindSuperman = null;
        } else {
          this.runners[runnerIndex].legs[index].timeBehindOverall =
            this.runners[runnerIndex].legs[index].timeOverall -
            legOverallTimes[0].time;
          this.runners[runnerIndex].legs[index].timeBehindSuperman =
            this.runners[runnerIndex].legs[index].timeOverall -
            this.superman[index];
        }
      });
    });
  }

  private calculateMistakes(): void {
    // Initialize mistakesSum array for mistake graph
    this.mistakesSum = new Array(this.course.length).fill(0);

    this.runners.forEach((runner) => {
      if (runner.status === "OK") {
        const percentageBehindSuperman = runner.legs.map((leg, legIndex) => {
          return leg.time / this.supermanSplits[legIndex];
        });
        const averagePercentage = this.arrayAverage(percentageBehindSuperman);

        let clearedPercentageBehindSuperman = [];
        percentageBehindSuperman.forEach((leg, legIndex) => {
          if (leg > averagePercentage * this.mistakeDetectionRatio) {
            runner.legs[legIndex].isMistake = true;
          } else {
            runner.legs[legIndex].isMistake = false;
            clearedPercentageBehindSuperman.push(leg);
          }
          // Make dataset for "Time behind superman"
          runner.timeBehindSupermanGraphData.push({
            x: this.superman[legIndex],
            y: runner.legs[legIndex].timeBehindSuperman,
          });
          // Make dataset for "Time behind leader"
          runner.timeBehindLeaderGraphData.push({
            x: this.leader[legIndex],
            y: runner.legs[legIndex].timeBehindOverall,
          });
        });

        // Recalculate average without mistakes
        let clearedAveragePercentage = this.arrayAverage(
          clearedPercentageBehindSuperman
        );

        // New pass to be sure to get all mistakes
        clearedPercentageBehindSuperman = [];
        percentageBehindSuperman.forEach((leg, legIndex) => {
          if (leg > clearedAveragePercentage * this.mistakeDetectionRatio) {
            runner.legs[legIndex].isMistake = true;
            this.mistakesSum[legIndex]++;
          } else {
            runner.legs[legIndex].isMistake = false;
            clearedPercentageBehindSuperman.push(leg);
          }
        });

        // Recalculate average without mistakes
        clearedAveragePercentage = this.arrayAverage(
          clearedPercentageBehindSuperman
        );

        let totalTimeLost = 0;
        runner.legs.forEach((leg, legIndex) => {
          if (leg.isMistake) {
            leg.timeWithoutMistake = Math.round(
              this.supermanSplits[legIndex] * clearedAveragePercentage
            );
            leg.timeLost = leg.time - leg.timeWithoutMistake;
            totalTimeLost = totalTimeLost + leg.timeLost;
          }
        });
        runner.totalTimeLost = totalTimeLost;
      }
    });
  }

  // Utils

  private sortRunners(a: RunnerForSort, b: RunnerForSort): number {
    if (a.time !== null && b.time !== null) {
      return a.time - b.time;
    } else if (a.time === null && b.time !== null) {
      return 1;
    } else if (a.time !== null && b.time === null) {
      return -1;
    } else {
      return 0;
    }
  }

  private arrayEquals(a: any[], b: any[]): boolean {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index])
    );
  }

  private arrayAverage(a: any[]): number {
    const b = a.length;
    let c = 0;
    for (let i = 0; i < b; i++) {
      c += Number(a[i]);
    }
    return c / b;
  }

  private timeToSeconds(time: string): number {
    // Convert a time in HH:MM:SS format to seconds
    const array = time.split(":");
    const length = array.length;
    let seconds = Number(array[length - 1]);

    if (length > 1) {
      seconds += Number(array[length - 2]) * 60;
    }

    if (length > 2) {
      seconds += Number(array[length - 3]) * 3600;
    }

    return seconds;
  }
}

interface RunnerForSort {
  id: number;
  time: number;
  rankSplit?: number;
  routeChoice?: Routechoice;
}
