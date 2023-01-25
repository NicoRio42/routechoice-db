import admin from "firebase-admin";

admin.initializeApp();

export { deleteCourse } from "./src/course.js";
export { getTractracData, getTractracInfo } from "./src/tractrac.js";
export {
  getGPSSeurantaData,
  getGPSSeurantaInit,
  getLiveServerTime,
  getLoggatorData,
} from "./src/two-d-rerun.js";
export {
  createUserWithRole,
  deleteUser,
  getUserList,
  getUserListOnRequest,
} from "./src/user.js";
export { getWinsplitData } from "./src/winsplit.js";
export { getLoggatorEvent, getLoggatorEventPoints } from "./src/loggator.js";
