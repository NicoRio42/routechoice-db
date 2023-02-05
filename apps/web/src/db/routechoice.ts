import type CourseData from "shared/o-utils/models/course-data";

export function changeRunnerRoutechoice(
  courseData: CourseData,
  newRoutechoiceID: string,
  runnerID: string,
  legNumber: number
): CourseData {
  // const routechoice = routechoices.find((r) => r.id === selectedRoutechoice);
  // if (routechoice === undefined) {
  //   console.warn("Cannot find back routechoice to update.");
  //   return;
  // }
  // const completeRunner = $courseData.runners.find((r) => r.id === runner.id);
  // if (completeRunner === undefined) {
  //   console.warn("Cannot find back runner to update.");
  //   return;
  // }
  // const routechoiceToAttribute = structuredClone(routechoice);
  // delete routechoiceToAttribute.statistics;
  // routechoiceToAttribute.track = [];
  // const legToUpdate = completeRunner.legs[$selectedLeg - 1];
  // if (legToUpdate === null) return;
  // legToUpdate.manualRouteChoice = routechoiceToAttribute;
  // // Update legs routechoices stats
  // $courseData.legs[$selectedLeg - 1] = createRoutechoiceStatisticsForOneLeg(
  //   $courseData.legs[$selectedLeg - 1],
  //   $selectedLeg,
  //   $courseData.runners
  // );
  // loading = true;
  // try {
  //   await updateDoc(
  //     doc(db, "coursesData", $courseData.id, "runners", runner.id),
  //     { legs: completeRunner.legs }
  //   );
  //   await updateDoc(doc(db, "coursesData", $courseData.id), {
  //     legs: serializeNestedArraysInLegs($courseData.legs),
  //   });
  // } catch (error) {
  //   alert("An error occured while manually updating the routechoice.");
  //   console.error(error);
  // } finally {
  //   loading = false;
  // }

  return courseData;
}
