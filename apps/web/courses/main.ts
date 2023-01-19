import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";
import { getFunctions } from "firebase/functions";
import firebaseConfig from "../environments/environment";
import userStore from "../shared/stores/user-store";
import "./2d-rerun-reset.css";
import App from "./App.svelte";
import "../shared/global.css";

const fireBaseApp = initializeApp(firebaseConfig);
getFunctions(fireBaseApp);
getFirestore(fireBaseApp);
const auth = getAuth(fireBaseApp);

onAuthStateChanged(auth, (user) => {
  userStore.set(user);
});

const app = new App({
  target: document.getElementById("app"),
});

export default app;
