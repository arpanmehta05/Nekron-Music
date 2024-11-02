import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyABZOlDf-0Uz6Im8iq6N4o4w34keoAqGRM",
  authDomain: "nekron-music-f5ae7.firebaseapp.com",
  projectId: "nekron-music-f5ae7",
  storageBucket: "nekron-music-f5ae7.appspot.com",
  messagingSenderId: "502735120735",
  appId: "1:502735120735:web:c384f117e3846c092baeea",
  measurementId: "G-FF9K34DZDZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
