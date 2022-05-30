import App from "./App.svelte";
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import firebaseDevConfig from "../firebase-env/dev";

const fireBaseApp = initializeApp(firebaseDevConfig);
const functions = getFunctions(fireBaseApp);
const db = getFirestore(fireBaseApp);

const app = new App({
  target: document.body,
  props: {
    name: "world",
  },
});

export default app;
