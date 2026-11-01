# 🚀 Taskflow – Full-Stack Task Management System

<p align="center">
  <img src="assets/banner/banner.png" alt="Taskflow Banner" width="100%" />
</p>

<p align="center">
  <img src="assets/GIF/GIF.gif" alt="Taskflow Application Demo" width="100%" />
</p>

<p align="center">
  A modern full-stack task management application built with <strong>React, Spring Boot, and MySQL</strong>.
  <br />
  Organize tasks, manage priorities, monitor productivity, and stay on top of deadlines with automated email reminders.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Authentication-JWT-blue?style=flat-square" alt="JWT Authentication" />
  <img src="https://img.shields.io/badge/API-REST-orange?style=flat-square" alt="REST API" />
  <img src="https://img.shields.io/badge/Email-Automated%20Reminders-success?style=flat-square" alt="Automated Email Reminders" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-informational?style=flat-square" alt="Project Status" />
</p>

---

## 📖 Overview

**Taskflow** is a full-stack task management application designed to simplify everyday task organization and productivity tracking.

Built with a React frontend, Spring Boot REST API, and MySQL database, Taskflow provides an integrated platform where users can manage tasks, organize priorities, track deadlines, and monitor their progress.

The application features JWT-based authentication, user-specific data management, an interactive dashboard, calendar-based task organization, and configurable automated email reminders.

The backend follows a layered architecture with clear separation of controllers, services, repositories, DTOs, and entities, while the frontend uses reusable React components and centralized application state.

## ✨ Key Features

### 🔐 Authentication & Security
- User registration and login.
- JWT-based authentication using Spring Security.
- Stateless authentication with Bearer tokens.
- BCrypt password hashing.
- Protected frontend routes.
- User-specific task and reminder-preference management.
- Isolation of data between authenticated users.

### 📊 Interactive Dashboard
- Overview of total, completed, pending, and overdue tasks.
- Task completion percentage.
- High, medium, and low priority distribution.
- Upcoming tasks based on due dates.
- Recently created tasks.
- Dynamically loaded dashboard statistics.

### 📝 Task Management
- Create, view, update, and delete tasks.
- Mark tasks as completed or reopen them.
- Assign HIGH, MEDIUM, or LOW priority.
- Set task due dates.
- Search by task title and description.
- Filter by priority and completion status.
- Sort tasks using supported fields.
- Paginated task listing.
- User-level task data isolation.

### 📅 Calendar
- Calendar-based task visualization.
- Organize tasks according to due dates.
- Navigate between calendar dates.
- Create tasks with the selected date automatically prefilled.
- View pending and completed tasks.

### 🔔 Automated Email Reminders
- One-day-before due-date reminders.
- Due-date reminders.
- Daily overdue reminders until task completion, when enabled.
- Individual reminder preferences for each account.
- Configurable reminder time and time zone.
- Automatic exclusion of completed tasks.
- Database-backed reminder logs to reduce duplicate notifications.
- Gmail SMTP integration.

### ⚙️ Settings & Preferences
- Light and dark appearance preferences.
- Task display and sorting preferences.
- Default task priority.
- Export task records as CSV.
- Configure email reminder preferences.
- Save reminder settings per account.

### 🎨 User Experience
- Modern, responsive application interface.
- Reusable React components.
- Interactive sidebar navigation.
- Loading, error, and success feedback states.
- Confirmation before important task actions.
- Responsive layouts for desktop and mobile screens.
- Route-level error handling and accessible navigation.

---

## 🖥️ Application Preview

### Dashboard

<p align="center">
  <img src="assets/screenshots/Dashboard.png" width="100%" alt="Taskflow Dashboard" />
  <br />
  <em>Monitor task statistics, productivity, upcoming tasks, and recent activity.</em>
</p>

### Task Management

| All Tasks | Create / Edit Task |
|:---:|:---:|
| <img src="assets/screenshots/All_Tasks.png" width="100%" alt="All Tasks" /> | <img src="assets/screenshots/Task_Modal.png" width="100%" alt="Task Creation Modal" /> |

### Calendar

<p align="center">
  <img src="assets/screenshots/Calendar.png" width="100%" alt="Taskflow Calendar" />
  <br />
  <em>Visualize and organize tasks according to their due dates.</em>
</p>

### Settings

<p align="center">
  <img src="assets/screenshots/Settings.png" width="100%" alt="Taskflow Settings" />
  <br />
  <em>Manage application preferences and automated reminder settings.</em>
</p>

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | Component-based UI development |
| JavaScript | Application logic |
| Vite | Development server and build tooling |
| React Router | Client-side navigation |
| Axios | HTTP communication with REST APIs |
| Lucide React | Interface icons |
| CSS | Responsive styling and UI design |

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Backend programming language |
| Spring Boot 4.x | Backend application framework |
| Spring Web | REST API development |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Database access and persistence |
| Hibernate | ORM implementation |
| Bean Validation | Request validation |
| Spring Boot Mail | Email notifications |
| Springdoc OpenAPI | API documentation |
| JJWT | JWT creation and validation |
| Maven | Dependency and build management |

### Database & Tools
| Technology | Purpose |
|---|---|
| MySQL 8 | Relational database |
| Git & GitHub | Version control and source management |
| Postman | REST API testing |
| Eclipse IDE | Backend development |
| Visual Studio Code | Frontend development |

---

## 🏗️ Application Architecture

Taskflow follows a client-server architecture in which the React frontend communicates with the Spring Boot backend through RESTful APIs.

```text
┌───────────────────────────────────────────┐
│              React Frontend               │
│                                           │
│  Dashboard | Tasks | Calendar | Settings  │
│  Authentication | Protected Routes       │
└─────────────────────┬─────────────────────┘
                      │
                      │ HTTP / JSON / JWT
                      ▼
┌───────────────────────────────────────────┐
│             Spring Boot Backend           │
│                                           │
│  Spring Security & JWT Filter             │
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
│                 MySQL                      │
│                                           │
│  Users | Tasks                            │
│  Reminder Preferences | Reminder Logs     │
└───────────────────────────────────────────┘
```

### Backend Request Flow

1. The frontend sends an HTTP request to the Spring Boot REST API.
2. Spring Security processes the request and validates the JWT for protected endpoints.
3. The controller receives the request and delegates processing to the service layer.
4. The service layer applies business logic and user-specific access restrictions.
5. Spring Data JPA communicates with MySQL through repositories.
6. The backend returns a structured JSON response to the frontend.

### Authentication Workflow

1. A user registers or logs in through the React application.
2. The backend validates the submitted credentials.
3. On successful authentication, the backend generates and returns a JWT access token.
4. The frontend maintains the authenticated session using browser `sessionStorage`.
5. Axios automatically attaches the Bearer token to protected API requests.
6. Spring Security validates the token and establishes the authenticated user context.
7. Task and reminder-preference operations are restricted to the authenticated account.

### Automated Reminder Workflow

1. The scheduled reminder service runs according to the configured schedule.
2. It retrieves enabled reminder preferences and identifies eligible tasks.
3. The reminder processor checks task status and claims the corresponding reminder record.
4. The email service sends the notification through Gmail SMTP.
5. The database records the reminder processing result to help prevent duplicate sends.

---

## 📂 Project Structure

```text
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
│   │
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
│   │
│   └── pom.xml
│
├── assets/
│   ├── banner/
│   ├── GIF/
│   └── screenshots/
│
└── README.md
```

---

## 🚀 Getting Started

Follow these instructions to set up and run Taskflow locally.

### 1. Prerequisites

Ensure the following tools are installed:

- JDK 21
- Node.js and npm
- MySQL 8
- Git
- Maven (if not using the Maven Wrapper)

### 2. Clone the Repository

```bash
git clone https://github.com/TanmayT134/Taskflow.git
cd Taskflow
```

### 3. Configure the MySQL Database

Start your MySQL server and create the database:

```sql
CREATE DATABASE taskflow_db;
```

### 4. Configure Backend Environment Variables

The backend requires database, JWT, and Gmail SMTP configuration.

Set the following variables using your own local credentials.

**Windows PowerShell**

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"

$env:JWT_SECRET="YOUR_BASE64_ENCODED_SECRET"
$env:JWT_EXPIRATION_MS="86400000"

$env:MAIL_USERNAME="your-gmail@gmail.com"
$env:MAIL_PASSWORD="YOUR_GMAIL_APP_PASSWORD"

$env:APP_FRONTEND_URL="http://localhost:5173"
```

**Linux / macOS**

```bash
export DB_URL="jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true"
export DB_USERNAME="root"
export DB_PASSWORD="YOUR_MYSQL_PASSWORD"

export JWT_SECRET="YOUR_BASE64_ENCODED_SECRET"
export JWT_EXPIRATION_MS="86400000"

export MAIL_USERNAME="your-gmail@gmail.com"
export MAIL_PASSWORD="YOUR_GMAIL_APP_PASSWORD"

export APP_FRONTEND_URL="http://localhost:5173"
```

**Configuration notes:**

- Generate your own strong Base64-encoded JWT secret compatible with the configured signing algorithm.
- Never commit actual passwords, JWT secrets, or other credentials to GitHub.
- `JWT_EXPIRATION_MS` represents the token lifetime in milliseconds; the documented default is 24 hours.
- Gmail SMTP requires an App Password when using a Gmail account with 2-Step Verification enabled. Do not use your regular Gmail password.
- `APP_FRONTEND_URL` determines the frontend link included in reminder emails.
- Ensure environment variables are available to the process launching Spring Boot. IDE run configurations may need separate environment-variable entries.

### 5. Run the Spring Boot Backend

Open a terminal and navigate to the backend directory:

```bash
cd taskflow-backend
```

Run using the Maven Wrapper, if included in the repository.

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

Alternatively, use installed Maven:

```bash
mvn spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

### 6. Configure and Run the React Frontend

Open another terminal:

```bash
cd taskflow-frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

Register an account and log in to start using Taskflow.

---

## 🔗 REST API Reference

**Base URL**

```text
http://localhost:8080/api/v1
```

Protected endpoints require a valid JWT access token:

```http
Authorization: Bearer <access-token>
```

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new account | Public |
| POST | `/auth/login` | Authenticate and receive JWT | Public |

### Task Management & Dashboard

| Method | Endpoint | Description |
|---|---|---|
| POST | `/tasks` | Create a new task |
| GET | `/tasks` | Retrieve tasks with filtering and pagination |
| GET | `/tasks/{id}` | Retrieve a task by ID |
| PUT | `/tasks/{id}` | Update task details |
| PATCH | `/tasks/{id}/completion` | Update task completion status |
| DELETE | `/tasks/{id}` | Delete a task |
| GET | `/tasks/stats` | Retrieve task statistics |
| GET | `/tasks/dashboard` | Retrieve dashboard statistics and task lists |

### Reminder Preferences

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reminders/preferences` | Retrieve the authenticated user's reminder preferences |
| PUT | `/reminders/preferences` | Update the authenticated user's reminder preferences |

### Supported Task Query Parameters

| Parameter | Description |
|---|---|
| `search` | Search by task title or description |
| `priority` | Filter by task priority |
| `completed` | Filter by completion status |
| `sortBy` | Select a supported sorting field |
| `direction` | Specify ascending or descending order |
| `page` | Select the page number |
| `size` | Specify the number of records per page |

### API Documentation

Taskflow uses Springdoc OpenAPI for interactive API documentation.

When the backend is running, access Swagger UI at:

```text
http://localhost:8080/swagger-ui/index.html
```

---

## 🔐 Security & Configuration

Taskflow incorporates several backend security practices:

- Passwords are stored using BCrypt hashing.
- Protected endpoints use stateless JWT authentication.
- Task operations are scoped to the authenticated user.
- Reminder preferences are associated with individual accounts.
- Reminder logs use database constraints and processing claims to reduce duplicate notifications.
- Database credentials, JWT secrets, and Gmail credentials are supplied through environment variables.
- CORS is configured for approved frontend origins.
- Request validation and centralized exception handling are implemented.

**Important:** The current project is configured for local development. Before exposing it publicly, additional production preparation is required, including HTTPS, production secrets, database migrations, backups, and a more secure token-storage strategy. Browser `sessionStorage` is JavaScript-accessible and is not equivalent to an HttpOnly cookie.

---

## 📌 Project Status & Future Improvements

**Current status:** The full-stack application is implemented and runs locally. Public deployment is not configured.

Potential future enhancements include:

- Expanded automated backend and frontend test coverage.
- Refresh-token and session lifecycle improvements.
- Email ownership verification and account recovery.
- Production database migrations and automated backups.
- Public deployment when suitable hosting is available.

---

## 🎯 Learning Outcomes

Taskflow demonstrates practical experience with:

- Component-based frontend development using React.
- RESTful API development using Spring Boot.
- Authentication and authorization using Spring Security and JWT.
- Layered backend architecture and separation of concerns.
- Relational database design using MySQL.
- ORM and persistence using Spring Data JPA and Hibernate.
- CRUD operations, search, filtering, sorting, and pagination.
- Frontend-backend integration using Axios.
- Scheduled background jobs and email notifications.
- Environment-based application configuration.
- Responsive UI development and reusable components.

---

## 👨‍💻 Author

<p align="center">
  <strong>Tanmay Tawade</strong>
  <br />
  Java Full Stack Developer | React | Spring Boot
</p>

<p align="center">
  <a href="https://github.com/TanmayT134">
    <img src="https://img.shields.io/badge/GitHub-TanmayT134-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/tanmay-tawade-995829344/">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://portfolio-tanmay-tawade.vercel.app/">
    <img src="https://img.shields.io/badge/Portfolio-Visit-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio" />
  </a>
</p>

---

<p align="center">
  ⭐ If you find Taskflow interesting, consider giving the repository a star!
</p>