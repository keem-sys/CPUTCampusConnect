# CPUT Campus Connect

[![React](https://img.shields.io/badge/React-Frontend-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-brightgreen.svg?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-Database-lightgrey.svg?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/Apache%202.0-License-blue.svg?style=flat-square&logo=apache)](LICENSE)

<!-- TODO: ADD SCREENSHOT OF THE APP DASHBOARD HERE -->

## Project Overview

CPUT Campus Connect is a full-stack web application developed as part of the 
**PRT362S Project III (Applications Development)** subject at the Cape Peninsula University of Technology (CPUT) 
for the 2026 academic year.

The goal of this application is to provide students, faculty, and university clubs with a centralized, 
user-friendly digital hub to discover, promote, and manage campus events effectively.

## Problem Definition

Currently, information regarding university events (academic workshops, social gatherings, club activities) is 
scattered across fragmented channels like physical notice boards and disorganized WhatsApp groups. 
This leads to poor event visibility for students and inefficient, 
manual RSVP tracking for event organizers. 
Furthermore, the absence of an automated capacity management system often results in overcrowded venues.

This web application aims to alleviate these challenges by providing a dedicated platform to:
- Centralize all campus event discoveries in one searchable dashboard.
- Replace manual RSVP tracking (spreadsheets/forms) with an automated registration system.
- Provide secure, role-based access for Students, Event Organizers, and Administrators.

## Key Features

**System Functionality (Currently in Development):**

- **User Authentication & Security:**
    - Secure user registration and login functionality.
    - Password hashing using BCrypt.
    - JWT (JSON Web Token) based session management for secure API communication.
    - Strict Role-Based Access Control (RBAC) distinguishing between `Admin`, `Organizer`, and `Student`.

- **Event Management (For Organizers):**
    - Create, Read, Update, and Delete (CRUD) functionality for events.
    - Requirement enforcement for event details (Title, Description, Date, Time, Venue, Capacity).

- **Event Discovery & Registration (For Students):**
    - Dynamic dashboard displaying upcoming events.
    - Keyword search and category/date filtering functionality.
    - One-click RSVP/Registration for events.
    - Automated system blocks preventing registration once an event reaches its maximum venue capacity.

## Technologies Used

This project utilizes a modern, decoupled architecture:

**Frontend (Client-Side):**
- **Library:** React.js
- **Styling:** Tailwind CSS
- **Package Manager:** Node Package Manager (npm)

**Backend (Server-Side):**
- **Framework:** Java Spring Boot (Java 17+)
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **ORM:** Spring Data JPA (Hibernate)
- **Build Tool:** Maven

**Database & Tools:**
- **Database:** MySQL (Relational Database)
- **IDE:** IntelliJ IDEA
- **Version Control:** Git & GitHub

## Setup and Running Instructions

**Prerequisites:**
- **Java Development Kit (JDK):** Version 17 or higher.
- **Node.js & npm:** Download from [Node.js](https://nodejs.org/).
- **MySQL Server:** Installed and running locally.
- **Git:** Installed on your machine.

**Steps to Setup and Run Locally:**

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/keem-sys/CPUTCampusConnect
    cd CPUTCampusConnect
    ```

2. **Database Setup (MySQL):**
    - Open your MySQL Workbench or terminal.
    - Create a new database named `campus_events_db`.

3. **Run the Backend (Spring Boot):**
    - Open the `/backend` folder in IntelliJ IDEA.
    - Navigate to `src/main/resources/application.properties` and update your MySQL credentials:
      ```properties
      spring.datasource.url=jdbc:mysql://localhost:3306/campus_events_db
      spring.datasource.username=your_mysql_username
      spring.datasource.password=your_mysql_password
      ```
    - Run the `CPUTCampusConnect.java` main class. The API will start on `http://localhost:8080`.

4. **Run the Frontend (React):**
    - Open a new terminal and navigate to the `/frontend` directory.
    - Install the required dependencies:
      ```bash
      npm install
      ```
    - Start the React development server:
      ```bash
      npm start
      ```
    - The application will open in your browser at `http://localhost:3000`.

## Contributors
This project is developed and maintained by :

<div style="text-align: left;">
  <a href="https://github.com/keem-sys" target="_blank" title="Ebenezer Kouakou - Project Lead" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/keem-sys.png?size=100" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Ebenezer"/>
  </a>
  <a href="https://github.com/Matthew-codez" target="_blank" title="Matthew Ferreira - Interface Designer" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/identicons/Matthew-codez.png" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Matthew"/>
  </a>
  <a href="https://github.com/Jaydenchoppa" target="_blank" title="Jayden Avontuur - Database Admin" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/identicons/Jaydenchoppa.png" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Jayden"/>
  </a>
  <a href="https://github.com/M-WazeerG" target="_blank" title="Mogamat Wazeer - Programmer" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/identicons/M-WazeerG.png" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Wazeer"/>
  </a>
  <a href="https://github.com/LisaTee-J" target="_blank" title="Lisakhanya Tinae Jonga - System Analyst" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/identicons/LisaTee-J.png" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Lisakhanya"/>
  </a>
  <a href="https://github.com/Coben220235686" target="_blank" title="Coben Maistry - GitHub/File Manager" style="display: inline-block; margin-right: 10px;">
    <img src="https://github.com/identicons/Coben220235686.png" width="80px;" style="border-radius:50%; border: 1px solid #888;" alt="Coben"/>
  </a>
</div>

* **Project Leader:** Ebenezer Kouakou
* **System Analyst:** Lisakhanya Tinae Jonga
* **Interface Designer:** Matthew Ferreira
* **Programmer:** Mogamat Wazeer
* **Database Administrator:** Jayden Avontuur
* **GitHub / File Manager:** Coben Maistry

## License

[Apache License 2.0](LICENSE)

This project is licensed under the **Apache License 2.0**.

This license is a permissive open-source license that grants broad freedoms to use, modify, and distribute the software for both commercial and non-commercial purposes. See the `LICENSE` file for the full license text.