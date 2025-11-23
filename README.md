# Z-VITPYQ Platform

## Overview
Z-VITPYQ is a comprehensive platform designed for VIT students to access, share, and manage Previous Year Question (PYQ) papers. The platform gamifies the contribution process, rewarding users with points and badges for uploading papers, fostering a community-driven repository of study resources.

## Features
- **📄 Paper Repository**: Easily upload, search, and download question papers.
- **🔍 Advanced Search**: Filter papers by Subject, Course Code, and Slot.
- **🏆 Gamification System**:
  - Earn **50 points** per upload.
  - Unlock ranks: **Silver**, **Gold**, **Diamond**, and **Legendary**.
  - Track profile stats (Uploads/Downloads).
- **👤 User Profiles**: Manage your uploads, view earned badges, and update profile details.
- **🎨 Modern UI**: Features a glassmorphism design with interactive bubble animations and a responsive layout.
- **💾 Robust Storage**:
  - **Standalone Version**: Uses `IndexedDB` for persistent local storage without a backend.
  - **Full Stack Version**: Includes a Node.js/Express backend and React frontend.

## Getting Started

### Quick Start (Standalone)
Simply open [pyq.html](cci:7://file:///c:/Users/z4pro/.gemini/antigravity/scratch/zvitpyq/pyq.html:0:0-0:0) in any modern web browser. No installation required. The application uses your browser's local storage to save data.

### Full Stack Development
To run the full MERN stack version (Client + Server):

1. **Prerequisites**: Ensure Node.js is installed.
2. **Setup**:
   - Install dependencies for server: `cd server && npm install`
   - Install dependencies for client: `cd client && npm install`
3. **Run**:
   - Execute the startup script:
     ```powershell
     ./start_app.ps1
     ```
   - Or start manually:
     - Backend: `npm start` (in `server/`) -> Runs on `http://localhost:5000`
     - Frontend: `npm run dev` (in `client/`) -> Runs on `http://localhost:5173`

## Project Structure
- [pyq.html](cci:7://file:///c:/Users/z4pro/.gemini/antigravity/scratch/zvitpyq/pyq.html:0:0-0:0) / [pyq.js](cci:7://file:///c:/Users/z4pro/.gemini/antigravity/scratch/zvitpyq/pyq.js:0:0-0:0) / [pyq.css](cci:7://file:///c:/Users/z4pro/.gemini/antigravity/scratch/zvitpyq/pyq.css:0:0-0:0): Core files for the standalone version.
- `server/`: Backend Node.js/Express application.
- `client/`: Frontend React/Vite application.
- [start_app.ps1](cci:7://file:///c:/Users/z4pro/.gemini/antigravity/scratch/zvitpyq/start_app.ps1:0:0-0:0): Automation script to launch both servers.

## Technologies Used
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+).
- **Storage**: IndexedDB (Client-side), MongoDB (Server-side).
- **Backend**: Node.js, Express.js.

---
*Built for the VIT Community.*
