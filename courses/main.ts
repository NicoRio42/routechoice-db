import App from "./App.svelte";
import "./2d-rerun-reset.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../firebase-env/dev";
import userStore from "../shared/stores/user-store";

const fireBaseApp = initializeApp(firebaseConfig);
const db = getFirestore(fireBaseApp);
const auth = getAuth(fireBaseApp);

onAuthStateChanged(auth, (user) => {
  userStore.set(user);
});

const app = new App({
  target: document.getElementById("app"),
});

export default app;
