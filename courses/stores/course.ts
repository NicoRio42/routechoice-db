import { writable } from "svelte/store";
import CourseData from "../../shared/o-utils/models/course-data";

const courseData = writable<CourseData>();

export default courseData;
