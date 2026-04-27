# Smart Campus Resource Management System

Campus resource booking and incident management app.

## Requirements

- Node.js 18+
- Java 17+
- Maven 3.8+
- MongoDB 6+

## Project

- backend: Spring Boot API
- frontend: React + Vite app

## Backend Setup

1. Go to backend folder.
2. Create backend/.env with:

```env
GOOGLE_CLIENT_ID=your_google_client_id
```

3. Start backend (recommended script, loads .env):

```powershell
cd backend
./run-backend-8081.ps1
```

Backend URL: http://localhost:8081

## Frontend Setup

1. Install dependencies and run:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Optional Frontend Env

Create frontend/.env only if needed:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
