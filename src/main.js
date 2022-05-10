import App from "./App.svelte";
import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTei7EpZgxIZuHFOZBhuQXSyCaaqo_rdg",
  authDomain: "routechoice-db-dev.firebaseapp.com",
  projectId: "routechoice-db-dev",
  storageBucket: "routechoice-db-dev.appspot.com",
  messagingSenderId: "215455261611",
  appId: "1:215455261611:web:13cab2dd06e508e0bc68ee",
};

const fireBaseApp = initializeApp(firebaseConfig);
const functions = getFunctions(fireBaseApp);
const db = getFirestore(fireBaseApp);

const app = new App({
  target: document.body,
  props: {
    name: "world",
  },
});

export default app;
