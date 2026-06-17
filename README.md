# Hello × Plan B — หน้าเสนอทำเลใหม่ (static + PWA)

หน้าฟอร์ม self-service สำหรับทีม Hello เสนอทำเลใหม่ให้ทีม BD ของ Plan B Media

## ทำไมต้องแยกมา host ที่นี่ (ไม่ใช่ GAS)
เดิมหน้านี้เสิร์ฟผ่าน Google Apps Script (`HtmlService`) ซึ่งรันใน **iframe sandbox ของ script.google.com** ทำให้เจอ 2 บั๊กที่แก้ใน GAS ไม่ได้:
1. เปิดในเบราว์เซอร์ที่ login Google หลายบัญชี → "Sorry, unable to open the file at present" (multi-login)
2. กล้องไม่เปิด (เด้งไปอัลบัม) + เลือกไฟล์ได้ครั้งเดียว (sandbox ตัดสิทธิ์ `capture` + proxy file dialog)

ย้ายมาเป็น static page บน host ปกติ (Vercel) แล้วคุยกับ GAS ผ่าน `fetch()` → หายทั้งคู่

## สถาปัตยกรรม
- **หน้านี้ (static)** = UI ล้วน ไม่มี secret. token อยู่ใน URL (`?key=`) เก็บลง localStorage
- **Backend** = ฟังก์ชัน GAS เดิม เรียกผ่าน JSON API:
  - `GET  <GAS>/exec?api=suggest&key=&q=` → ชื่อทำเลที่คล้ายกัน
  - `GET  <GAS>/exec?api=status&key=` → สถานะ site ของทีม Hello
  - `POST <GAS>/exec?api=createSite&key=` (body JSON) → สร้าง site
  - `POST <GAS>/exec?api=uploadImage&key=` (body JSON) → อัปโหลดรูป
  - ทุก endpoint ผ่าน token gate (`HELLO_ACCESS_TOKEN` ใน Script Properties)
  - CORS: GAS ใส่ `Access-Control-Allow-Origin: *` ให้เอง; POST ใช้ `Content-Type: text/plain` (simple request ไม่มี preflight)
- `GAS_EXEC` (URL ปลายทาง) ตั้งใน `index.html` — ถ้าเปลี่ยน deployment ต้องแก้ค่านี้

## ไฟล์
- `index.html` — หน้าฟอร์ม + สถานะ (ทั้งหมดอยู่ในไฟล์เดียว)
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA (ติดตั้ง "เพิ่มไปหน้าจอหลัก")

## Deploy (Vercel)
zero-config — Vercel เห็น `index.html` ที่ root แล้ว serve เป็น static ได้เลย (ไม่ต้อง build)

## ลิงก์ที่ส่งให้ทีม Hello
`https://<vercel-domain>/?key=<HELLO_ACCESS_TOKEN>`
