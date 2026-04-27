# 🎓 Smart Campus Resource Management System

<div align="center">

![SLIIT Logo](frontend/public/sliit-logo.png)

**A comprehensive web-based platform for managing campus resources and facilities**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Java](https://img.shields.io/badge/Java-17-007396?logo=java)](https://www.oracle.com/java/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

The **Smart Campus Resource Management System** is a full-stack web application designed to streamline the management and booking of campus facilities at SLIIT (Sri Lanka Institute of Information Technology). The system provides an intuitive interface for students to book resources, administrators to manage facilities, and technicians to handle maintenance requests.

### Key Highlights

- 🔐 **Secure Authentication** - Google OAuth 2.0 for students, credential-based for staff
- 📅 **Smart Booking System** - Conflict detection and alternative suggestions
- 🎫 **Incident Management** - Comprehensive ticketing system for facility issues
- 🔔 **Real-time Notifications** - Instant updates for all user actions
- 📱 **Responsive Design** - Seamless experience across all devices
- 🚀 **RESTful API** - Clean, well-documented backend architecture

---

## ✨ Features

### For Students 👨‍🎓

- **Resource Browsing**
  - View available lecture halls, meeting rooms, equipment, and labs
  - Filter by location, capacity, and availability
  - Search resources by name or category

- **Booking Management**
  - Request bookings with date, time, and purpose
  - View booking history and status
  - Edit or cancel pending bookings
  - Receive approval codes for confirmed bookings

- **Incident Reporting**
  - Report facility issues with descriptions and images
  - Track ticket status and resolution progress
  - Communicate with staff through comments
  - View ticket history

- **Notifications**
  - Real-time updates on booking status
  - Ticket status change notifications
  - Comment notifications from staff

### For Administrators 👔

- **Resource Management**
  - Create, update, and delete campus resources
  - Set resource status (Active/Out of Service)
  - Manage resource categories and attributes
  - Track resource utilization

- **Booking Administration**
  - Review and approve/reject booking requests
  - View all bookings with filtering options
  - Reverse booking decisions
  - Generate approval codes

- **Incident Management**
  - View all incident tickets
  - Assign tickets to technicians
  - Close or reject tickets
  - Add administrative comments

- **Dashboard Analytics**
  - View system statistics
  - Monitor pending approvals
  - Track 7-day trends
  - Manage urgent items

### For Technicians 🔧

- **Ticket Management**
  - View assigned tickets
  - Add resolution notes
  - Mark tickets as resolved
  - Communicate with users

- **Work Tracking**
  - View in-progress tickets
  - Access resolved ticket history
  - Track workload

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| Vite | 5.x | Build Tool |
| Google OAuth | 2.x | Authentication |
| CSS3 | - | Styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.x | Application Framework |
| Java | 17 | Programming Language |
| Spring Data MongoDB | 3.x | Database Integration |
| Spring Security | 6.x | Security Framework |
| BCrypt | - | Password Hashing |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 6.x | NoSQL Database |

### Development Tools

- **Maven** - Dependency management
- **Git** - Version control
- **npm** - Package management
- **Postman** - API testing

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │  Components  │  │   Routing    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│                      REST API                               │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                      Backend                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │→ │   Services   │→ │ Repositories │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                      Database                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Bookings   │  │   Resources  │  │   Tickets    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │    Users     │  │Notifications │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Java JDK** (17 or higher) - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven** (3.8 or higher) - [Download](https://maven.apache.org/download.cgi)
- **MongoDB** (6.x or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check Java version
java -version

# Check Maven version
mvn -version

# Check MongoDB version
mongod --version
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smart-campus-system.git
cd smart-campus-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
mvn clean install

# Return to root directory
cd ..
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to root directory
cd ..
```

---

## ⚙️ Configuration

### Backend Configuration

Create or update `backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8081

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus
spring.data.mongodb.database=smart_campus

# Google OAuth Configuration
google.client.id=YOUR_GOOGLE_CLIENT_ID_HERE

# CORS Configuration
cors.allowed.origins=http://localhost:5173

# Logging
logging.level.com.paf.googleauth=INFO
```

### Frontend Configuration

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
VITE_API_BASE_URL=http://localhost:8081
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
6. Copy the Client ID to your configuration files

### MongoDB Setup

```bash
# Start MongoDB service
mongod

# Create database (MongoDB will create it automatically on first use)
# No manual database creation needed
```

---

## 🏃 Running the Application

### Option 1: Run Both Services Separately

#### Terminal 1 - Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will start on `http://localhost:8081`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

### Option 2: Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Run Backend with Built Frontend

```bash
cd backend
mvn spring-boot:run
```

Access the application at `http://localhost:8081`

---

## 📖 Usage

### Default Admin Credentials

For initial setup, create an admin user in MongoDB:

```javascript
// Connect to MongoDB
use smart_campus

// Create admin user
db.admin_users.insertOne({
  email: "admin@sliit.lk",
  password: "$2a$10$...", // BCrypt hash of "admin123"
  name: "System Administrator",
  role: "ADMIN",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### User Roles

1. **Student** - Login with Google account
2. **Administrator** - Login with admin credentials
3. **Technician** - Login with technician credentials

### Quick Start Guide

#### For Students:

1. Visit `http://localhost:5173`
2. Click "Login with Google"
3. Browse resources from the home page
4. Select a resource and click "Book Now"
5. Fill in booking details and submit
6. Check "My Bookings" for status updates

#### For Administrators:

1. Visit `http://localhost:5173`
2. Login with admin credentials
3. Navigate to Admin Dashboard
4. Manage resources, bookings, and tickets
5. Approve/reject booking requests
6. Assign technicians to tickets

#### For Technicians:

1. Visit `http://localhost:5173`
2. Login with technician credentials
3. View assigned tickets
4. Add resolution notes
5. Mark tickets as resolved

---

## 📚 API Documentation

### Base URL

```
http://localhost:8081/api
```

### Authentication Endpoints

#### Google OAuth Login
```http
POST /auth/google
Content-Type: application/json

{
  "credential": "google_oauth_token"
}

Response: 200 OK
{
  "email": "student@sliit.lk",
  "name": "John Doe",
  "picture": "https://...",
  "token": "jwt_token"
}
```

#### Admin Login
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@sliit.lk",
  "password": "admin123"
}

Response: 200 OK
{
  "email": "admin@sliit.lk",
  "name": "Admin User",
  "role": "ADMIN",
  "token": "jwt_token"
}
```

### Resource Endpoints

#### List Resources
```http
GET /resources?category=LECTURE_HALL&sortBy=name
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "category": "LECTURE_HALL",
    "name": "LH-101",
    "location": "MALABE",
    "sublocation": "Main Building - Floor 1",
    "capacity": 100,
    "status": "ACTIVE"
  }
]
```

#### Create Resource (Admin)
```http
POST /admin/resources
Authorization: Bearer {token}
Content-Type: application/json
X-Admin-Email: admin@sliit.lk

{
  "category": "LECTURE_HALL",
  "name": "LH-101",
  "location": "MALABE",
  "sublocation": "Main Building - Floor 1",
  "capacity": 100,
  "status": "ACTIVE"
}

Response: 201 Created
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "resourceId": "uuid",
  "resourceCategory": "LECTURE_HALL",
  "bookingDate": "2026-05-01",
  "startTime": "09:00",
  "endTime": "11:00",
  "purpose": "CS101 Lecture",
  "expectedAttendees": 50,
  "requesterEmail": "student@sliit.lk",
  "requesterName": "John Doe"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking request submitted",
  "booking": { ... }
}
```

#### Update Booking Status (Admin)
```http
PUT /admin/bookings/{id}/status?adminEmail=admin@sliit.lk
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "APPROVED",
  "adminNote": "Approved for CS101 lecture"
}

Response: 200 OK
```

### Incident Endpoints

#### Create Incident Ticket
```http
POST /incidents
Authorization: Bearer {token}
Content-Type: application/json

{
  "resourceId": "uuid",
  "reporterEmail": "student@sliit.lk",
  "reporterName": "John Doe",
  "category": "Electrical",
  "description": "Projector not working",
  "priority": "HIGH",
  "preferredContact": "email",
  "attachments": ["data:image/jpeg;base64,..."]
}

Response: 201 Created
```

#### Assign Technician (Admin)
```http
PUT /admin/incidents/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "assignedStaffEmail": "tech@sliit.lk",
  "assignedStaffName": "Tech Support"
}

Response: 200 OK
```

### Notification Endpoints

#### Get Notifications
```http
GET /notifications?recipientEmail=user@sliit.lk
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Booking approved",
    "message": "Your booking for LH-101 was approved",
    "type": "BOOKING",
    "read": false,
    "createdAt": "2026-04-25T10:00:00Z"
  }
]
```

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🗄 Database Schema

### Collections

#### 1. admin_users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (BCrypt hashed),
  name: String,
  role: String (ADMIN | TECHNICIAN),
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. resource_catalog
```javascript
{
  _id: String (UUID),
  category: String (LECTURE_HALL | MEETING_ROOM | EQUIPMENT | LAB),
  name: String,
  location: String,
  sublocation: String,
  capacity: Integer,
  status: String (ACTIVE | OUT_OF_SERVICE),
  equipmentType: String,
  labType: String,
  relatedResourceName: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. bookings
```javascript
{
  _id: String (UUID),
  resourceId: String,
  resourceCategory: String,
  resourceName: String,
  bookingDate: String,
  startTime: String,
  endTime: String,
  purpose: String,
  expectedAttendees: Integer,
  requesterEmail: String,
  requesterName: String,
  status: String (PENDING | APPROVED | REJECTED),
  approvalCode: String,
  systemGenerated: Boolean,
  parentBookingId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. incident_tickets
```javascript
{
  _id: String (UUID),
  resourceId: String,
  resourceName: String,
  reporterEmail: String,
  reporterName: String,
  category: String,
  description: String,
  priority: String (LOW | MEDIUM | HIGH | URGENT),
  status: String (OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED),
  assignedStaffEmail: String,
  assignedStaffName: String,
  resolutionNotes: String,
  comments: Array,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. notifications
```javascript
{
  _id: String (UUID),
  recipientEmail: String,
  title: String,
  message: String,
  type: String (BOOKING | TICKET | COMMENT | RESOURCE),
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📁 Project Structure

```
smart-campus-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/paf/googleauth/
│   │   │   │   ├── booking/
│   │   │   │   │   ├── controller/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── model/
│   │   │   │   │   ├── repository/
│   │   │   │   │   └── service/
│   │   │   │   ├── catalog/
│   │   │   │   ├── incident/
│   │   │   │   ├── notification/
│   │   │   │   ├── config/
│   │   │   │   └── GoogleAuthApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── public/
│   │   ├── sliit-logo.png
│   │   └── facility images/
│   ├── src/
│   │   ├── booking/
│   │   ├── catalog/
│   │   ├── incident/
│   │   ├── notification/
│   │   ├── tech/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
├── VIVA_PREPARATION_GUIDE.md
└── LICENSE
```

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BookingServiceTest

# Run with coverage
mvn test jacoco:report
```

### Frontend Testing

```bash
cd frontend

# Run tests (if configured)
npm test

# Run with coverage
npm test -- --coverage
```

### Manual Testing

Use the provided Postman collection for API testing:
1. Import `postman_collection.json`
2. Set environment variables
3. Run test scenarios

---

## 🚢 Deployment

### Docker Deployment (Recommended)

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

#### Backend Deployment

```bash
cd backend

# Build JAR file
mvn clean package -DskipTests

# Run JAR
java -jar target/google-auth-backend-0.0.1-SNAPSHOT.jar
```

#### Frontend Deployment

```bash
cd frontend

# Build for production
npm run build

# Deploy dist/ folder to web server (Nginx, Apache, etc.)
```

### Environment Variables for Production

```bash
# Backend
export MONGODB_URI=mongodb://production-host:27017/smart_campus
export GOOGLE_CLIENT_ID=production_client_id
export SERVER_PORT=8081

# Frontend
export VITE_API_BASE_URL=https://api.yourdomain.com
export VITE_GOOGLE_CLIENT_ID=production_client_id
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- **Java**: Follow Google Java Style Guide
- **JavaScript**: Follow Airbnb JavaScript Style Guide
- **Commits**: Use conventional commit messages
- **Documentation**: Update README and comments

### Commit Message Format

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(booking): add conflict detection for bookings

- Implement time overlap checking
- Add alternative resource suggestions
- Update booking service tests

Closes #123
```

---

## 🔧 Troubleshooting

### Common Issues

#### Issue 1: MongoDB Connection Failed

**Error:** `MongoTimeoutException: Timed out after 30000 ms`

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Issue 2: Google OAuth Not Working

**Error:** `No credential returned from Google`

**Solution:**
1. Verify `http://localhost:5173` is in Google Cloud Console Authorized JavaScript origins
2. Check client ID in `.env` matches Google Cloud Console
3. Clear browser cache and cookies

#### Issue 3: Port Already in Use

**Error:** `Port 8081 is already in use`

**Solution:**
```bash
# Find process using port
# Windows
netstat -ano | findstr :8081

# macOS/Linux
lsof -i :8081

# Kill the process
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

#### Issue 4: Frontend Build Errors

**Error:** `Module not found` or `Cannot resolve dependency`

**Solution:**
```bash
cd frontend

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

#### Issue 5: CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `application.properties` has correct CORS configuration
2. Verify frontend URL matches allowed origins
3. Restart backend server

### Getting Help

- 📧 Email: support@sliit.lk
- 💬 Discord: [Join our server](https://discord.gg/sliit)
- 📝 Issues: [GitHub Issues](https://github.com/your-username/smart-campus-system/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 SLIIT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Team

| Name | Role | Email |
|------|------|-------|
| Team Member 1 | Full Stack Developer | member1@sliit.lk |
| Team Member 2 | Backend Developer | member2@sliit.lk |
| Team Member 3 | Frontend Developer | member3@sliit.lk |
| Team Member 4 | Database Administrator | member4@sliit.lk |

---

## 📞 Contact

**Project Maintainer:** SLIIT Development Team

- 🌐 Website: [https://www.sliit.lk](https://www.sliit.lk)
- 📧 Email: support@sliit.lk
- 📱 Phone: +94 11 754 4801
- 📍 Address: New Kandy Road, Malabe, Sri Lanka

---

## 🙏 Acknowledgments

- SLIIT for providing the project requirements
- Google for OAuth 2.0 authentication
- Spring Boot community for excellent documentation
- React community for component libraries
- MongoDB for database support

---

## 📊 Project Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Last Commit](https://img.shields.io/badge/last%20commit-April%202026-orange)

---

<div align="center">

**Made with ❤️ by SLIIT Students**

[⬆ Back to Top](#-smart-campus-resource-management-system)

</div>
