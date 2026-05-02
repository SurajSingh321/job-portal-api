# Job Portal API 🧑‍💼

A REST API for job portal with role-based authentication.

## Features
- User signup/login with JWT authentication
- Two roles — Company and Student
- Company can post, update, delete jobs
- Student can browse jobs and apply
- Company can accept/reject applications

## Tech Stack
- Node.js
- Express.js
- MySQL
- JWT + bcrypt
- dotenv

## API Endpoints

### Auth
| Method | Endpoint  | Description        | Access |
|--------|-----------|--------------------|--------|
| POST   | /signup   | Register user      | Public |
| POST   | /login    | Login user         | Public |

### Jobs
| Method | Endpoint   | Description        | Access  |
|--------|------------|--------------------|---------|
| GET    | /jobs      | Get all jobs       | Public  |
| POST   | /jobs      | Post a job         | Company |
| PUT    | /jobs/:id  | Update a job       | Company |
| DELETE | /jobs/:id  | Delete a job       | Company |

### Applications
| Method | Endpoint                  | Description              | Access  |
|--------|---------------------------|--------------------------|---------|
| POST   | /jobs/:id/apply           | Apply for a job          | Student |
| GET    | /applications             | Get my applications      | Student |
| GET    | /jobs/:id/applications    | Get job applications     | Company |
| PUT    | /applications/:id         | Accept/Reject application| Company |

## Setup

### 1. Clone 
```bash
git clone https://github.com/SurajSingh321/job-portal-api.git
cd job-portal-api
```

### 2. Install 
```bash
npm install
```

### 3. MAKE `.env` 
