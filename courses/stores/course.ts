import { writable } from "svelte/store";
import type CourseData from "../../shared/o-utils/models/course-data";

const courseData = writable<CourseData>();

export default courseData;
