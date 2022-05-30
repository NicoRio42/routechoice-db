import App from "./App.svelte";
import "./2d-rerun-reset.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import firebaseDevConfig from "../firebase-env/dev";

const fireBaseApp = initializeApp(firebaseDevConfig);
const db = getFirestore(fireBaseApp);

const app = new App({
  target: document.getElementById("app"),
});

export default app;
