/**
 *
 * @param {import("../../models/runner").Runner[]} runners
 * @param {*} routes
 * @returns {import("../../models/runner").Runner[]}
 */
export const detectRunnersByName = (runners, routes) => {
  const modifiedRoutes = routes.map((route) => {
    const [firstName, lastName] = route.runnername.split(" ");
    return { firstName, lastName };
  });

  runners.forEach((runner) => {
    runner.rerun2dRouteIndex = null;

    modifiedRoutes.forEach((route, index) => {
      if (
        runner.firstName.toLowerCase() === route.firstName.toLowerCase() &&
        runner.lastName.toLowerCase() === route.lastName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      } else if (
        runner.firstName.toLowerCase() === route.lastName.toLowerCase() &&
        runner.lastName.toLowerCase() === route.firstName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      } else if (
        runner.firstName.charAt(0).toLowerCase() ===
          route.firstName.charAt(0).toLowerCase() &&
        runner.lastName.toLowerCase() === route.lastName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      } else if (
        runner.firstName.charAt(0).toLowerCase() ===
          route.lastName.charAt(0).toLowerCase() &&
        runner.lastName.toLowerCase() === route.firstName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      } else if (
        runner.lastName.charAt(0).toLowerCase() ===
          route.firstName.charAt(0).toLowerCase() &&
        runner.firstName.toLowerCase() === route.lastName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      } else if (
        runner.lastName.charAt(0).toLowerCase() ===
          route.lastName.charAt(0).toLowerCase() &&
        runner.firstName.toLowerCase() === route.firstName.toLowerCase()
      ) {
        runner.rerun2dRouteIndex = index;
      }
    });
  });

  return runners;
};
