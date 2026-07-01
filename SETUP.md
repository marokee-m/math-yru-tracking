# วิธี Deploy ระบบ MATH-YRU บน GitHub Pages + Firebase

## ขั้นตอนที่ 1 — สร้าง Firebase Project (ฟรี)

1. ไปที่ https://console.firebase.google.com
2. คลิก **"Add project"** → ตั้งชื่อ เช่น `math-yru-tracking`
3. ปิด Google Analytics → **Create project**
4. ไปที่ **Firestore Database** → **Create database** → **Start in test mode** → Next → Enable
5. ไปที่ **Project Settings** (⚙️) → **General** → เลื่อนลงหา **"Your apps"**
6. คลิก **"</>"** (Web app) → ตั้งชื่อ → **Register app**
7. Copy ค่า `firebaseConfig` ที่ได้

---

## ขั้นตอนที่ 2 — ใส่ Firebase Config

เปิดไฟล์ `src/firebase-config.js` แล้วแทนที่ด้วยค่าที่ copy มา:

```javascript
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "math-yru-tracking.firebaseapp.com",
  projectId:         "math-yru-tracking",
  storageBucket:     "math-yru-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};

window.SEED_ON_EMPTY = true;  // เติมข้อมูลตัวอย่างครั้งแรก
```

---

## ขั้นตอนที่ 3 — ทดสอบในเครื่องก่อน

เปิดไฟล์ `index.html` ในเบราว์เซอร์ → ดูว่าระบบโหลดข้อมูลจาก Firestore ได้ไหม

> ถ้าขึ้น error CORS ให้ใช้ Live Server extension ใน VS Code แทน

---

## ขั้นตอนที่ 4 — ตั้ง Firestore Security Rules

ไปที่ Firebase Console → Firestore → **Rules** → วางค่านี้:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // อนุญาตให้อ่าน/เขียนได้จากทุกที่ (สำหรับ demo)
    // Production ควรเพิ่ม auth check
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

คลิก **Publish**

---

## ขั้นตอนที่ 5 — Upload ขึ้น GitHub

### 5.1 สร้าง Repository ใหม่
1. ไปที่ https://github.com → **New repository**
2. ชื่อ: `math-yru-tracking` → **Public** → **Create repository**

### 5.2 Push ไฟล์ขึ้น GitHub
```bash
git init
git add .
git commit -m "initial deploy"
git branch -M main
git remote add origin https://github.com/USERNAME/math-yru-tracking.git
git push -u origin main
```

---

## ขั้นตอนที่ 6 — เปิด GitHub Pages

1. ไปที่ Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. คลิก **Save**
5. รอ ~1 นาที → URL จะขึ้นเป็น `https://USERNAME.github.io/math-yru-tracking`

---

## หลังจาก Deploy แล้ว

- เปิดเว็บครั้งแรก → ระบบจะ seed ข้อมูลตัวอย่างลง Firestore อัตโนมัติ
- เปิด `src/firebase-config.js` → เปลี่ยน `SEED_ON_EMPTY = false` แล้ว push ใหม่
- ข้อมูลที่แก้ไขในระบบจะบันทึกลง Firestore ถาวร real-time ทันที

---

## Demo Credentials
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin` |
| นักศึกษา | `6640112001` (หรือรหัสอื่น) | `1234` |
| อาจารย์ | `malee` หรือ `somsak` | `advisor1234` |
