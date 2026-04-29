# SpendSmart Setup

## Overview

This project has two parts:

- `backend/` — Express API server using MongoDB
- `frontend/` — React application that connects to the backend at `http://localhost:5000/api`

## Backend Setup

1. Open PowerShell in `SpendSmart/backend`
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create a `.env` file with these values:
   ```ini
   PORT=5000
   MONGO_URI=<your MongoDB connection string>
   JWT_SECRET=<your secret>
   ```
4. Start the backend:
   ```powershell
   node server.js
   ```

The backend API is available at `http://localhost:5000`.

## Frontend Setup

1. Open PowerShell in `SpendSmart/frontend`
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the React app:
   ```powershell
   npm start
   ```
4. Open the app in the browser:
   ```text
   http://localhost:3000
   ```

## Important Notes

- The frontend uses `frontend/src/services/api.js` with `baseURL: "http://localhost:5000/api"`.
- Start the backend before using the frontend.
- If you change backend port, update `frontend/src/services/api.js` accordingly.
