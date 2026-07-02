// Firebase Configuration — MATH-YRU Tracking System
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAcl6lYOMVOupgjeF7flRMTfWLUpg5CUbU",
  authDomain:        "math-yru-tracking.firebaseapp.com",
  projectId:         "math-yru-tracking",
  storageBucket:     "math-yru-tracking.firebasestorage.app",
  messagingSenderId: "153474048102",
  appId:             "1:153474048102:web:7c27bc6dd690de319d4da7"
};

// true = เติมข้อมูลตัวอย่างถ้า Firestore ว่าง (ครั้งแรก)
// เปลี่ยนเป็น false หลังจาก seed แล้ว
window.SEED_ON_EMPTY = true;

// Google Drive OAuth Client ID
// วิธีสร้าง: https://console.cloud.google.com → APIs & Services → Credentials → Create OAuth 2.0 Client ID
// Authorized JS origins: https://marokee-m.github.io
window.GDRIVE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
