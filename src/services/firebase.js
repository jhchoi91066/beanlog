// Firebase Configuration and Initialization
// 문서 참조: The Foundation - 기술/디자인 결정서

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-Y5CQGv2aHRPTEX4Bm4AumnIaiMGiYKU",
  authDomain: "beanlog-app-459cc.firebaseapp.com",
  projectId: "beanlog-app-459cc",
  storageBucket: "beanlog-app-459cc.firebasestorage.app",
  messagingSenderId: "201972315752",
  appId: "1:201972315752:web:6bc5407026381859ef2ddd",
  measurementId: "G-5LXXL44NKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
