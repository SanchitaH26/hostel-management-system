# 🏨 Smart Hostel Complaint Management System

A full-stack web application with a complete **DevOps pipeline** — built with Spring Boot, React, MySQL, Docker, Jenkins, and Ansible.

---

## 📁 Project Structure

```
smart-hostel-complaint/
├── backend/                   ← Spring Boot REST API
│   ├── src/
│   │   ├── main/java/com/hostel/
│   │   │   ├── model/         ← User, Complaint entities
│   │   │   ├── repository/    ← JPA repositories
│   │   │   ├── service/       ← Business logic
│   │   │   ├── controller/    ← REST controllers
│   │   │   ├── config/        ← Security config
│   │   │   └── dto/           ← Data transfer objects
│   │   └── resources/
│   │       └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                  ← React UI
│   ├── src/
│   │   ├── pages/             ← AuthPage, StudentDashboard, AdminDashboard
│   │   ├── components/        ← Topbar
│   │   └── services/api.js    ← Axios API calls
│   ├── Dockerfile
│   └── package.json
│
├── ansible/
│   ├── playbook.yml           ← Deployment automation
│   └── inventory.ini
│
├── docker-compose.yml         ← Full stack orchestration
├── Jenkinsfile                ← CI/CD pipeline
├── init.sql                   ← DB seed (admin + student)
└── README.md
```

---

## 🚀 Quick Start

### Option A — Run with Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/smart-hostel-complaint.git
cd smart-hostel-complaint

# 2. Start everything
docker-compose up --build

# 3. Open browser
# Frontend → http://localhost:3000
# Backend  → http://localhost:8080
```

### Option B — Run Locally (Without Docker)

**Backend:**
```bash
cd backend
# Edit src/main/resources/application.properties with your MySQL password
mvn clean package
java -jar target/complaint-system.jar
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Demo Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@hostel.edu       | admin123    |
| Student | student@hostel.edu     | student123  |

> You can also register new accounts directly from the UI.

---

## 🌐 API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/auth/register`              | Register new user        |
| POST   | `/api/auth/login`                 | Login                    |
| POST   | `/api/complaints/{studentId}`     | Raise a complaint        |
| GET    | `/api/complaints/student/{id}`    | Get student's complaints |
| GET    | `/api/complaints`                 | Get all complaints       |
| PUT    | `/api/complaints/{id}/status`     | Update status            |
| DELETE | `/api/complaints/{id}`            | Delete complaint         |
| GET    | `/api/complaints/stats`           | Dashboard stats          |

---

## 🔄 DevOps Pipeline

| Stage    | Tool        | What it does                              |
|----------|-------------|-------------------------------------------|
| Plan     | GitHub      | Issues, README, version control           |
| Code     | Git         | Push → trigger Jenkins                    |
| Build    | Maven       | Compile → generate `.jar`                 |
| Test     | JUnit       | 12 unit tests for complaint logic         |
| Release  | Jenkins     | Automated build + test + approval         |
| Deploy   | Docker      | Containerized deployment                  |
| Operate  | Docker Compose | Multi-service orchestration            |
| Monitor  | Docker logs | `docker logs hostel-backend`              |

---

## 🧪 Run Tests

```bash
cd backend
mvn test
```

---

## 🤖 Jenkins Setup (Windows)

1. Install Jenkins from https://jenkins.io
2. Start Jenkins: open `http://localhost:8080`
3. Create a new Pipeline job
4. Point it to this repo
5. Jenkins reads `Jenkinsfile` automatically

---

## ⚙️ Ansible Deployment

```bash
# Install Ansible (WSL or Linux)
pip install ansible

# Run playbook
ansible-playbook ansible/playbook.yml
```

---

## 📊 Monitor Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker logs hostel-backend -f

# Just MySQL
docker logs hostel-mysql -f
```
