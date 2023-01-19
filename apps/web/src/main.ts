import App from "./App.svelte";
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../environments/environment";
import userStore from "../shared/stores/user-store";
import "../shared/global.css";

const fireBaseApp = initializeApp(firebaseConfig);
getFunctions(fireBaseApp);
getFirestore(fireBaseApp);
const auth = getAuth(fireBaseApp);

onAuthStateChanged(auth, (user) => {
  userStore.set(user);
});

const app = new App({
  target: document.body,
});

export default app;
