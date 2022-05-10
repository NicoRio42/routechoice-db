import About from "./routes/About.svelte";
import CoursesOverview from "./routes/CoursesOverview.svelte";
import Course from "./routes/Course.svelte";
import Home from "./routes/Home.svelte";
import Login from "./routes/Login.svelte";

export const routes = {
  "/courses": CoursesOverview,
  "/": Course,
  "/courses/:courseId": Course,
  "/home": Home,
  "/about": About,
  "/login": Login,
};
