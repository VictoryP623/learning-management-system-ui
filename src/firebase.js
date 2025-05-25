// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAOe8aXmke9okbk0zr9tSDc2Gv56706BpU",
    authDomain: "learning-management-syst-8d035.firebaseapp.com",
    projectId: "learning-management-syst-8d035",
    storageBucket: "learning-management-syst-8d035.appspot.com",
    messagingSenderId: "635275652654",
    appId: "1:635275652654:web:3be4a32d815ae8b18b39bf",
    measurementId: "G-7GWLNHRE42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);