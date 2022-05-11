import Course from "./routes/Course.svelte";
import CoursesOverview from "./routes/CoursesOverview.svelte";
import Login from "./routes/Login.svelte";

export const routes = {
  "/": CoursesOverview,
  "/courses/:courseId": Course,
  "/login": Login,
};
