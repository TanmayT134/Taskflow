```{=html}
<p align="center">
```
`<img src="assets/banner/banner.png" alt="Taskflow - Full Stack Task Management System" width="100%" />`{=html}
```{=html}
</p>
```
```{=html}
<h1 align="center">
```
Taskflow -- Full-Stack Task Management System
```{=html}
</h1>
```
```{=html}
<p align="center">
```
`<img src="assets/GIF/GIF.gif" width="100%" alt="Taskflow Application Demo" />`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
A full-stack task management application built with
`<strong>`{=html}React`</strong>`{=html}, `<strong>`{=html}Spring
Boot`</strong>`{=html}, and `<strong>`{=html}MySQL`</strong>`{=html}.
`<br />`{=html} Organize tasks, manage priorities, track productivity,
and receive automated email reminders.
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />`{=html}
`<img src="https://img.shields.io/badge/Spring%20Boot-4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />`{=html}
`<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />`{=html}
`<img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://img.shields.io/badge/Authentication-JWT-blue?style=flat-square" alt="JWT Authentication" />`{=html}
`<img src="https://img.shields.io/badge/API-REST-orange?style=flat-square" alt="REST API" />`{=html}
`<img src="https://img.shields.io/badge/Email-Scheduled%20Reminders-success?style=flat-square" alt="Scheduled email reminders" />`{=html}
`<img src="https://img.shields.io/badge/Status-Local%20Development-informational?style=flat-square" alt="Local development" />`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## Overview

**Taskflow** is a full-stack task management application designed to
help users organize their work and monitor their productivity from a
single interface.

The application combines a React frontend with a Spring Boot REST API
and a MySQL database. Users can register and log in, manage their own
tasks, organize work by priority and due date, review progress through a
dashboard and calendar, and configure automated email reminders.

The backend follows a layered architecture using controllers, services,
repositories, DTOs, and JPA entities. Spring Security and JWT
authentication protect private endpoints and ensure that task and
reminder-preference data is scoped to the authenticated user.

> **Project status:** Taskflow is developed and run locally. Public
> deployment is not currently configured.

## Features

### Authentication and account security

-   User registration and login.
-   JWT-based authentication with stateless Spring Security.
-   BCrypt password hashing.
-   Protected application routes.
-   Authenticated API requests using Bearer tokens.
-   User-specific task and reminder-preference data.

### Dashboard

-   Total, completed, pending, and overdue task statistics.
-   Task completion percentage.
-   High, medium, and low priority breakdown.
-   Upcoming tasks.
-   Recently created tasks.

### Task management

-   Create, view, update, and delete tasks.
-   Mark tasks as completed or reopen them.
-   Set task priority and due dates.
-   Search by task title and description.
-   Filter by priority and completion status.
-   Sort and paginate task records.
-   User-level data isolation.

### Calendar

-   View tasks by due date.
-   Navigate calendar dates.
-   Create a task with the selected calendar date prefilled.
-   View pending and completed tasks.

### Email reminders

-   Automated email reminders for tasks with due dates.
-   One-day-before reminders.
-   Due-date reminders.
-   Daily overdue reminders until the task is completed, when enabled.
-   Per-account reminder preferences.
-   Configurable reminder time and time zone.
-   Completed tasks are excluded from reminders.
-   Database-backed reminder logs help prevent duplicate sends.

The default reminder schedule is 9:00 AM in the `Asia/Kolkata` time
zone. Users can change supported reminder preferences in Settings.

### Settings and usability

-   Theme and task display preferences.
-   Default task priority and sorting preferences.
-   Export task records as CSV.
-   Configure email reminder preferences.
-   Responsive layout for desktop and mobile screens.
-   Loading, error, and success feedback states.
-   Accessible navigation and route-level error handling.

------------------------------------------------------------------------

## Application Screenshots

The following images show the main Taskflow interfaces.

```{=html}
<p align="center">
```
`<img src="assets/screenshots/Dashboard.png" width="100%" alt="Taskflow Dashboard" />`{=html}
`<br />`{=html} `<strong>`{=html}Dashboard`</strong>`{=html}
```{=html}
</p>
```
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                        All Tasks                                                                           Create / Edit Task
  -------------------------------------------------------------------------------------- ----------------------------------------------------------------------------------------
   `<img src="assets/screenshots/All_Tasks.png" width="100%" alt="All Tasks" />`{=html}   `<img src="assets/screenshots/Task_Modal.png" width="100%" alt="Task Modal" />`{=html}

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<img src="assets/screenshots/Calendar.png" width="100%" alt="Taskflow Calendar" />`{=html}
`<br />`{=html} `<strong>`{=html}Calendar`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="assets/screenshots/Settings.png" width="100%" alt="Taskflow Settings" />`{=html}
`<br />`{=html} `<strong>`{=html}Settings and
Preferences`</strong>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   React 18
-   JavaScript
-   Vite
-   React Router
-   Axios
-   Lucide React
-   CSS

### Backend

-   Java 21
-   Spring Boot 4.x
-   Spring Web
-   Spring Security
-   Spring Data JPA
-   Hibernate
-   Bean Validation
-   Spring Boot Mail
-   Springdoc OpenAPI
-   Maven
-   JJWT

### Database

-   MySQL 8

### Development tools

-   Git and GitHub
-   Postman
-   Eclipse IDE
-   Visual Studio Code

------------------------------------------------------------------------

## Architecture

Taskflow uses a client-server architecture. The React application
communicates with the Spring Boot backend through REST APIs. The backend
authenticates requests, applies business rules, and accesses MySQL
through Spring Data JPA.

``` text
┌───────────────────────────────────────────┐
│              React Frontend               │
│                                           │
│  Dashboard | Tasks | Calendar | Settings  │
│  Auth Context | Protected Routes          │
└─────────────────────┬─────────────────────┘
                      │
                      │ HTTP / JSON / Bearer JWT
                      ▼
┌───────────────────────────────────────────┐
│             Spring Boot Backend           │
│                                           │
│  Security & JWT Filter                    │
│  REST Controllers                         │
│  Service Layer                            │
│  Repository Layer                         │
│  Validation & Exception Handling          │
│  Reminder Scheduler & Email Service       │
└─────────────────────┬─────────────────────┘
                      │
                      │ JPA / Hibernate
                      ▼
┌───────────────────────────────────────────┐
│                MySQL                      │
│                                           │
│  Users | Tasks | Reminder Preferences     │
│  Reminder Logs                            │
└───────────────────────────────────────────┘
```

### Authentication flow

1.  A user registers or logs in through the frontend.
2.  The backend validates the credentials.
3.  On successful login, the backend returns a JWT access token and user
    information.
4.  The frontend stores the session information in browser
    `sessionStorage`.
5.  Axios attaches the token to protected API requests using the
    `Authorization: Bearer` header.
6.  Spring Security validates the token and establishes the
    authenticated user context.
7.  Backend task and preference operations are scoped to that user.

### Reminder workflow

1.  The scheduler checks for eligible reminders at the configured
    schedule.
2.  It loads enabled reminder preferences and identifies tasks due
    tomorrow, due today, or overdue.
3.  The reminder processor checks task status and claims a reminder
    record.
4.  The email service sends the reminder through Gmail SMTP.
5.  The reminder log records the send result to help avoid duplicate
    processing.

------------------------------------------------------------------------

## Project Structure

``` text
Taskflow/
│
├── taskflow-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── taskflow-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/taskflow/taskflow_backend/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── enums/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   ├── scheduler/
│   │   │   │   ├── security/
│   │   │   │   └── service/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── assets/
│   ├── banner/
│   ├── GIF/
│   └── screenshots/
│
└── README.md
```

------------------------------------------------------------------------

## Getting Started

### Prerequisites

Install the following:

-   JDK 21
-   Node.js and npm
-   MySQL 8
-   Git
-   Maven, if you are not using the Maven Wrapper

### 1. Clone the repository

``` bash
git clone https://github.com/TanmayT134/Taskflow.git
cd Taskflow
```

### 2. Create the database

Start MySQL and create the database:

``` sql
CREATE DATABASE taskflow_db;
```

The backend uses environment variables for database connection details.

### 3. Configure backend environment variables

Set the following variables before starting the backend. Replace the
example values with your own local configuration.

**Windows PowerShell:**

``` powershell
$env:DB_URL="jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"

$env:JWT_SECRET="YOUR_BASE64_ENCODED_SECRET"
$env:JWT_EXPIRATION_MS="86400000"

$env:MAIL_USERNAME="your-gmail@gmail.com"
$env:MAIL_PASSWORD="YOUR_GMAIL_APP_PASSWORD"

$env:APP_FRONTEND_URL="http://localhost:5173"
```

**Linux / macOS:**

``` bash
export DB_URL="jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true"
export DB_USERNAME="root"
export DB_PASSWORD="YOUR_MYSQL_PASSWORD"

export JWT_SECRET="YOUR_BASE64_ENCODED_SECRET"
export JWT_EXPIRATION_MS="86400000"

export MAIL_USERNAME="your-gmail@gmail.com"
export MAIL_PASSWORD="YOUR_GMAIL_APP_PASSWORD"

export APP_FRONTEND_URL="http://localhost:5173"
```

**Configuration notes:** - `JWT_SECRET` must be a sufficiently strong
Base64-encoded secret compatible with the configured JJWT signing
algorithm. Generate your own secret; never use a sample or commit it. -
`JWT_EXPIRATION_MS` is optional and defaults to `86400000` milliseconds
(24 hours). - Gmail SMTP uses an App Password when 2-Step Verification
is enabled. Do not use your normal Gmail account password. -
`APP_FRONTEND_URL` is used to construct the link in reminder emails. -
These environment variables must be available to the process that starts
Spring Boot. IDE launch configurations may need their own
environment-variable entries.

### 4. Start the Spring Boot backend

Open a terminal:

``` bash
cd taskflow-backend
```

Run with the Maven Wrapper, if available:

**Windows:**

``` powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

``` bash
./mvnw spring-boot:run
```

Alternatively, use installed Maven:

``` bash
mvn spring-boot:run
```

The backend runs at:

``` text
http://localhost:8080
```

### 5. Configure and start the frontend

Open a second terminal:

``` bash
cd taskflow-frontend
npm install
```

Create a `.env` file in the frontend directory:

``` env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Start Vite:

``` bash
npm run dev
```

Open the URL shown by Vite, normally:

``` text
http://localhost:5173
```

Register an account and log in to use Taskflow.

------------------------------------------------------------------------

## REST API

**Base URL**

``` text
http://localhost:8080/api/v1
```

Protected endpoints require a valid JWT access token in the request
header:

``` http
Authorization: Bearer <access-token>
```

### Authentication

  Method   Endpoint           Description                      Access
  -------- ------------------ -------------------------------- --------
  `POST`   `/auth/register`   Register a new account           Public
  `POST`   `/auth/login`      Authenticate and receive a JWT   Public

### Tasks and dashboard

  --------------------------------------------------------------------------
  Method                  Endpoint                   Description
  ----------------------- -------------------------- -----------------------
  `POST`                  `/tasks`                   Create a task

  `GET`                   `/tasks`                   Retrieve tasks with
                                                     filtering and
                                                     pagination

  `GET`                   `/tasks/{id}`              Retrieve a task

  `PUT`                   `/tasks/{id}`              Update task details

  `PATCH`                 `/tasks/{id}/completion`   Update completion
                                                     status

  `DELETE`                `/tasks/{id}`              Delete a task

  `GET`                   `/tasks/stats`             Retrieve task
                                                     statistics

  `GET`                   `/tasks/dashboard`         Retrieve dashboard
                                                     statistics and task
                                                     lists
  --------------------------------------------------------------------------

### Reminder preferences

  --------------------------------------------------------------------------
  Method                  Endpoint                   Description
  ----------------------- -------------------------- -----------------------
  `GET`                   `/reminders/preferences`   Retrieve the
                                                     authenticated user's
                                                     reminder preferences

  `PUT`                   `/reminders/preferences`   Update the
                                                     authenticated user's
                                                     reminder preferences
  --------------------------------------------------------------------------

### Task query parameters

The task listing endpoint supports:

  Parameter     Description
  ------------- -------------------------------------
  `search`      Search task titles and descriptions
  `priority`    Filter by priority
  `completed`   Filter by completion status
  `sortBy`      Select a supported sorting field
  `direction`   Ascending or descending order
  `page`        Page number
  `size`        Number of records per page

### API documentation

Springdoc OpenAPI provides interactive API documentation while the
backend is running:

``` text
http://localhost:8080/swagger-ui/index.html
```

------------------------------------------------------------------------

## Security and Configuration Notes

-   Passwords are hashed using BCrypt.
-   Protected API routes use stateless JWT authentication.
-   Task operations are scoped to the authenticated user.
-   Reminder preferences are associated with individual users.
-   Reminder processing uses database-backed claims and a unique
    task/reminder-type/reminder-date constraint to reduce duplicate
    sends.
-   Database, JWT, and Gmail credentials are supplied through
    environment variables.
-   CORS is configured in the backend for approved frontend origins.

**Local-development note:** The current project configuration is
intended for local development. Before exposing the application
publicly, configure production secrets, HTTPS, allowed origins, database
migrations, backups, and an appropriate token-storage strategy. Browser
`sessionStorage` is accessible to JavaScript and is not an HttpOnly
cookie.

## Current Scope and Future Improvements

Taskflow currently runs locally and is not deployed to a public hosting
provider.

Potential future improvements include:

-   Automated backend and frontend test coverage.
-   Refresh-token/session lifecycle improvements.
-   Email ownership verification and account recovery.
-   Production database migrations and backup automation.
-   Production deployment when suitable hosting is available.

------------------------------------------------------------------------

## Learning Outcomes

This project demonstrates practical experience with:

-   Building a component-based frontend using React.
-   Developing REST APIs using Spring Boot.
-   Implementing JWT authentication with Spring Security.
-   Applying layered architecture and separation of concerns.
-   Designing relational data models with MySQL.
-   Integrating databases using Spring Data JPA and Hibernate.
-   Implementing CRUD operations, search, filtering, sorting, and
    pagination.
-   Integrating frontend and backend using Axios.
-   Scheduling background jobs and sending email notifications.
-   Managing configuration and secrets through environment variables.
-   Building responsive interfaces and reusable components.

------------------------------------------------------------------------

## Author

```{=html}
<p align="center">
```
`<strong>`{=html}Tanmay Tawade`</strong>`{=html} `<br />`{=html} Java
Full Stack Developer \| React \| Spring Boot
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<a href="https://github.com/TanmayT134">`{=html}
`<img src="https://img.shields.io/badge/GitHub-TanmayT134-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />`{=html}
`</a>`{=html}
`<a href="https://www.linkedin.com/in/tanmay-tawade-995829344/">`{=html}
`<img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />`{=html}
`</a>`{=html}
`<a href="https://portfolio-tanmay-tawade.vercel.app/">`{=html}
`<img src="https://img.shields.io/badge/Portfolio-Visit-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />`{=html}
`</a>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

```{=html}
<p align="center">
```
If you find this project interesting, consider giving the repository a
star.
```{=html}
</p>
```
