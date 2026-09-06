@echo off
cd /d C:\Users\Asus\OneDrive\Documents\Desktop\skill+3\apps\api
set JWT_SECRET=dev-secret-key-change-in-production-1234567890abcdef
set PORT=3001
set NODE_ENV=development
set CORS_ORIGIN=http://localhost:5173
npx tsx src/index.ts
