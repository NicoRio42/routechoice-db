import App from "./App.svelte";
// import { initializeApp } from "firebase/app";
// import { getFunctions, httpsCallable } from "firebase/functions";

// console.log(window.mapviewer);

// const firebaseConfig = {
//   apiKey: "AIzaSyBTei7EpZgxIZuHFOZBhuQXSyCaaqo_rdg",
//   authDomain: "routechoice-db-dev.firebaseapp.com",
//   projectId: "routechoice-db-dev",
//   storageBucket: "routechoice-db-dev.appspot.com",
//   messagingSenderId: "215455261611",
//   appId: "1:215455261611:web:13cab2dd06e508e0bc68ee",
// };

// const fireBaseApp = initializeApp(firebaseConfig);
// const functions = getFunctions(fireBaseApp);
// const get2DRerunData = httpsCallable(functions, "get2DRerunData");

// const get2DRerunDataUrl = buildGet2DRerunDataUrlFromLogatorUrl(
//   "https://events.loggator.com/uzYcLg"
// );

// getData(get2DRerunDataUrl);

const app = new App({
  target: document.getElementById("app"),
});

export default app;

// function buildGet2DRerunDataUrlFromLogatorUrl(logatorUrl) {
//   const urlArray = logatorUrl.split("/");
//   const logatorId = urlArray[urlArray.length - 1];
//   return `http://loggator2.worldofo.com/getseu_json.php?baseurl=http://www.tulospalvelu.fi/gps/&idstr=logatec${logatorId}`;
// }

// async function getData(get2DRerunDataUrl) {
//   const response = await get2DRerunData(get2DRerunDataUrl).catch((error) =>
//     console.log(error)
//   );
//   console.log(response);
//   window.mapviewer.handlelLoadseuSuccessResponse(response.data, "");
// }
