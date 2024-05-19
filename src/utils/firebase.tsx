// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDv7esOWY5indXZ7YQfeH20q05SDgU2dQ4",
  authDomain: "wazaa-afeec.firebaseapp.com",
  projectId: "wazaa-afeec",
  storageBucket: "wazaa-afeec.appspot.com",
  messagingSenderId: "454843787814",
  appId: "1:454843787814:web:21722d75d5c25376b454e7",
  measurementId: "G-SGNZ5D5B4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// S'assurer que 'window' est défini avant d'utiliser les fonctions qui en dépendent
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      const analytics = getAnalytics(app);
    } else {
      console.log("Analytics not supported");
    }
  });
  const analytics = getAnalytics(app);
}

export { auth };
