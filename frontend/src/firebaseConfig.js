import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDANp9nXnZ25LbS8MRu0I10LM_shaTt1u0",
  authDomain: "hostel-allocation-abb38.firebaseapp.com",
  projectId: "hostel-allocation-abb38",
  storageBucket: "hostel-allocation-abb38.firebasestorage.app",
  messagingSenderId: "579836350716",
  appId: "1:579836350716:web:bd4e3aa744a0f56aa70779"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);