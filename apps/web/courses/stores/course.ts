import { writable } from "svelte/store";
import type { Course } from "../../shared/models/course";

const course = writable<Course>();

export default course;
