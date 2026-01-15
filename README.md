

# Setup Guide

A modern **full-stack web application** with authentication, AI integration, cloud storage, and maps support.
Follow the steps below and you’ll be **up and running in minutes**.

---

## Demo Video

**Walkthrough:**
[https://drive.google.com/file/d/1lesNWIk4y7lBmIhZxQE5iGu_VIe_bjAJ/view?usp=drivesdk](https://drive.google.com/file/d/1lesNWIk4y7lBmIhZxQE5iGu_VIe_bjAJ/view?usp=drivesdk)

---

## Tech Stack

* Frontend: Vite + React
* Backend: Node.js + Express
* Database: MongoDB
* Authentication: JWT + Google OAuth
* Cloud Storage: AWS S3
* AI Integration: OpenAI
* Maps: Google Maps API

---

## Project Structure

```bash
root
├── backend
└── frontend
```

---

## Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file inside `backend/` and add:

```env
# Server
PORT=
NODE_ENV=
CLIENT_URL=

# MongoDB
MONGODB_URI=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# AI Service
AI_PROVIDER=openai
OPENAI_API_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=
```

### Run Backend

```bash
npm run dev
```

The backend server should now be running.

---

## Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file inside `frontend/` and add:

```env
VITE_API_BASE_URL=
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_OAUTH_CLIENT_ID=
```

### Run Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` by default.

---

## Features Overview

* Secure JWT-based authentication
* Google OAuth login
* AI-powered features using OpenAI
* File uploads via AWS S3
* Location and map integration using Google Maps
* Scalable and clean project architecture

---

## Notes

* Ensure MongoDB is accessible (local instance or MongoDB Atlas).
* Verify Google OAuth redirect URIs are correctly configured.
* Do not commit `.env` files to version control.

---

## Final Note

And you would be up and running.


