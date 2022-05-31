import App from "./App.svelte";
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseDevConfig from "../firebase-env/dev";
import userStore from "../shared/stores/user-store";

const fireBaseApp = initializeApp(firebaseDevConfig);
const functions = getFunctions(fireBaseApp);
const db = getFirestore(fireBaseApp);
const auth = getAuth(fireBaseApp);

onAuthStateChanged(auth, (user) => {
  userStore.set(user);
});

const app = new App({
  target: document.body,
});

export default app;
