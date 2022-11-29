import { writable } from "svelte/store";
import type CourseData from "../../shared/o-utils/models/course-data";

const courseData = writable<CourseData>({
  id: "",
  course: [],
  legs: [],
  runners: [],
  map: null,
  date: 0,
  name: "",
  statistics: null,
  timeOffset: 0,
});

export default courseData;
