# CPUT Campus Connect

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](LICENSE)

CPUT Campus Connect is a campus event discovery and management platform built for the Cape Peninsula University of Technology (CPUT). Students can find events and manage their RSVPs, organizers can publish events and manage attendees, and administrators can oversee users and events.

The project is being developed for **PRT362S Project III (Applications Development), 2026**. It brings event information and registration together in one place instead of relying on scattered notices and manual RSVP lists.

## Features

- **Student experience:** Browse upcoming events, view event details, RSVP or cancel an RSVP, view registered events, and manage a profile.
- **Organizer tools:** Create and manage events, review event attendees, and remove attendees when needed.
- **Administration:** Review platform statistics, users, and events; change user roles and remove users or events.
- **Authentication and access control:** Register and log in using JWT authentication. Passwords are BCrypt-hashed, and role-based permissions distinguish students, organizers, and administrators.
- **Capacity-aware registration:** Event registration is handled by the backend, which enforces event rules including capacity.
- **Demo content:** On first startup against an empty database, the backend seeds demo users and sample events.

## Technology

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL
- **Authentication:** JWT and BCrypt

The frontend and backend are separate applications. The browser UI runs on `http://localhost:5173` and makes API requests to `http://localhost:8080` during local development.

## Requirements

- Java Development Kit (JDK) 21
- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+ recommended) and npm
- MySQL Server
- Git (to clone the repository)

## Run Locally

### 1. Get the code

```bash
git clone https://github.com/keem-sys/CPUTCampusConnect.git
cd CPUTCampusConnect
```

If you already have the project locally, run the following commands from its root directory.

### 2. Create the database

Create a local MySQL database, for example:

```sql
CREATE DATABASE campus_events_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Configure and start the backend

Create a private local configuration file from the provided example.

PowerShell:

```powershell
Copy-Item backend/src/main/resources/application-secret.properties.example backend/src/main/resources/application-secret.properties
```

macOS/Linux:

```bash
cp backend/src/main/resources/application-secret.properties.example backend/src/main/resources/application-secret.properties
```

Edit `backend/src/main/resources/application-secret.properties` and provide values for these properties:

```properties
JWT_SECRET=replace-with-a-long-random-secret
DATABASE_URL=jdbc:mysql://localhost:3306/campus_events_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
PORT=8080
```

Use a strong, private JWT secret and your own local MySQL credentials. Do not commit `application-secret.properties` or use demo credentials in a production deployment. The backend imports this file as an optional local configuration file; the environment variables with the same names can also be supplied by your runtime.

Start the backend from the `backend` directory so the local configuration path resolves correctly.

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend
./mvnw spring-boot:run
```

The API listens on `http://localhost:8080` by default. On its first run with an empty users table, it creates demo users and sample events. JPA is configured to update the schema automatically for local development.

### 4. Install and start the frontend

Open another terminal at the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. Keep the backend running as well. The frontend currently targets the API at `http://localhost:8080`, and the backend allows browser requests from `http://localhost:5173`.

## Demo Accounts

These accounts are inserted only when the database has no users. Use them for local development and demonstrations only.

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@cput.ac.za` | `AdminPass123!` |
| Organizer | `fid.events@cput.ac.za` | `Organizer123!` |
| Student | `john.student@mycput.ac.za` | `Student123!` |

Additional organizers and students are also seeded. To start over with the demo dataset, clear the local database before restarting the backend; this removes all data in that database.

## Useful Commands

Run these from the appropriate `backend` or `frontend` directory.

| Task | Command |
| --- | --- |
| Run backend tests (Windows) | `.\mvnw.cmd test` |
| Run backend tests (macOS/Linux) | `./mvnw test` |
| Install frontend dependencies | `npm ci` |
| Check frontend lint | `npm run lint` |
| Build frontend for production | `npm run build` |
| Preview production frontend build | `npm run preview` |

## API Overview

The backend exposes a JSON REST API. Login and registration are public; other application routes require a valid bearer token. Role restrictions apply to organizer and administrator operations.

| Area | Base path | Examples |
| --- | --- | --- |
| Authentication | `/api/auth` | `POST /register`, `POST /login` |
| Events and RSVPs | `/api/events` | Browse events, event details, organizer events, attendee management, RSVP and cancellation |
| User profile | `/api/users` | Current profile, profile update, account deletion |
| Administration | `/api/admin` | Platform statistics, user and event management |

## Project Structure

```text
backend/   Spring Boot REST API, persistence, security, and tests
frontend/  React and TypeScript single-page application
LICENSE    Apache License 2.0
```

## Team

- **Project Lead:** [Ebenezer Kouakou](https://github.com/keem-sys)
- **System Analyst:** [Lisakhanya Tinae Jonga](https://github.com/LisaTee-J)
- **Interface Designer:** [Matthew Ferreira](https://github.com/Matthew-codez)
- **Programmer:** [Mogamat Wazeer](https://github.com/M-WazeerG)
- **Database Administrator:** [Jayden Avontuur](https://github.com/Jaydenchoppa)
- **GitHub / File Manager:** [Coben Maistry](https://github.com/Coben220235686)

## License

This project is licensed under the [Apache License 2.0](LICENSE).