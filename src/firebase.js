import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyA8iSKidWsPWa_33vZvVhMjyklaahTar24",
  authDomain: "test-7054d.firebaseapp.com",
  projectId: "test-7054d",
  storageBucket: "test-7054d.appspot.com",
  messagingSenderId: "3420971650",
  appId: "1:3420971650:web:f29fb8155ca24208130a9b",
  measurementId: "G-CN0LBBKJH2",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
