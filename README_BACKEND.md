# Backend API Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=success_academy_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## Database Setup

### Option 1: Using Docker (Recommended)

1. Start PostgreSQL using Docker Compose:
```bash
docker-compose -f docker-compose.dev.yml up -d postgres
```

2. Wait for PostgreSQL to be ready, then run migrations:
```bash
cd server
npm run migrate
```

### Option 2: Local PostgreSQL

1. Create a database:
```sql
CREATE DATABASE success_academy_db;
```

2. Run migrations:
```bash
cd server
npm run migrate
```

## Running the Server

### Development Mode
```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

### Production Mode
```bash
cd server
npm start
```

## API Endpoints

### Users API

- `GET /api/users` - Get all users (supports query params: search, role, status, limit, offset)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check

- `GET /health` - Check server and database status

## Example API Calls

### Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "status": "Active"
  }'
```

### Get All Users
```bash
curl http://localhost:5000/api/users
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "status": "Inactive"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/1
```

## Frontend Configuration

Make sure your frontend `.env` file includes:
```env
VITE_API_URL=http://localhost:5000/api
```

## Database Schema

### Users Table
- `id` - SERIAL PRIMARY KEY
- `name` - VARCHAR(255) NOT NULL
- `email` - VARCHAR(255) UNIQUE NOT NULL
- `role` - VARCHAR(50) DEFAULT 'Student'
- `status` - VARCHAR(50) DEFAULT 'Active'
- `password` - VARCHAR(255) (optional)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Troubleshooting

1. **Database Connection Error**: Make sure PostgreSQL is running and credentials in `.env` are correct
2. **Port Already in Use**: Change PORT in `.env` file
3. **CORS Error**: Update CORS_ORIGIN in `.env` to match your frontend URL

