# Success Together Academy - LMS

A modern Learning Management System built with React and Vite.

## Features

- Modern and responsive UI design
- Fast development with Vite
- Mobile-friendly interface
- Clean and intuitive user experience

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Docker Setup

This project includes Docker configuration for both development and production environments.

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Docker version 20.10 or higher

### Development Mode

Run the application in development mode with hot-reload:

**Using docker-compose (Recommended):**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Or using Docker directly:**
```bash
docker build -f Dockerfile.dev -t success-academy-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules success-academy-dev
```

The application will be available at `http://localhost:5173`

### Production Mode

Build and run the production version:

**Using docker-compose (Recommended):**
```bash
docker-compose -f docker-compose.prod.yml up --build
```

**Or using Docker directly:**
```bash
docker build -t success-academy-prod .
docker run -p 80:80 success-academy-prod
```

The application will be available at `http://localhost`

### Docker Compose Commands

**Start development server:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Start production server:**
```bash
docker-compose -f docker-compose.prod.yml up
```

**Stop containers:**
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
```

**Rebuild containers:**
```bash
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.prod.yml up --build
```

**View logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f
```

**Restart specific service:**
```bash
docker restart success-academy-api      # Restart API server
docker restart success-academy-postgres # Restart PostgreSQL
docker restart success-academy-pgadmin  # Restart pgAdmin
```

### Docker Files Overview

- `Dockerfile` - Multi-stage production build using Nginx
- `Dockerfile.dev` - Development build with hot-reload support
- `docker-compose.yml` - Combined configuration for both environments
- `docker-compose.dev.yml` - Development-specific configuration
- `docker-compose.prod.yml` - Production-specific configuration
- `nginx.conf` - Nginx configuration for production server
- `.dockerignore` - Files to exclude from Docker build context

## Project Structure

```
success-together-academy-v1/
├── src/
│   ├── components/
│   │   └── common/           # Reusable components (Button, Card, Table, Modal, etc.)
│   ├── layouts/
│   │   └── AdminLayout.jsx   # Admin dashboard layout
│   ├── pages/
│   │   ├── admin/            # Admin pages (Dashboard, Users, Roles, Courses, etc.)
│   │   └── Home.jsx          # Home page component
│   ├── services/
│   │   └── api.js            # API service utilities
│   ├── styles/
│   │   └── Home.css          # Home page styles
│   ├── App.jsx               # Main app component
│   ├── App.css               # App-level styles
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── server/
│   ├── config/
│   │   └── database.js       # PostgreSQL connection configuration
│   ├── models/
│   │   ├── User.js           # User model with CRUD operations
│   │   └── Role.js           # Role model with CRUD operations
│   ├── routes/
│   │   ├── users.js          # User API routes
│   │   ├── roles.js          # Role API routes
│   │   └── auth.js           # Authentication routes (register, login)
│   ├── migrations/
│   │   └── migrate.js        # Database migrations
│   ├── scripts/
│   │   └── verify-db.js      # Database verification script
│   ├── server.js             # Express server entry point
│   └── package.json          # Backend dependencies
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Frontend dependencies
├── Dockerfile                # Production Dockerfile
├── Dockerfile.dev            # Development Dockerfile
├── docker-compose.yml        # Docker Compose configuration
├── docker-compose.dev.yml    # Development Docker Compose
├── docker-compose.prod.yml   # Production Docker Compose
├── nginx.conf                # Nginx configuration for production
└── .dockerignore             # Docker ignore file
```

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Vite
- CSS3 (Custom properties, Flexbox, Grid)

### Backend
- Node.js & Express
- PostgreSQL
- bcryptjs (Password hashing)

### DevOps
- Docker & Docker Compose
- Nginx (for production)
- pgAdmin 4 (Database management)

## Current Status

- Basic setup complete
- Home page implemented
- Docker configuration (dev & production)
- Admin dashboard with reusable components
- User CRUD operations with PostgreSQL
- Role CRUD operations
- Self-registration with role-based control
- pgAdmin 4 for database management

## Troubleshooting

### Restart API Server
If you encounter route not found errors or need to reload server changes:
```bash
docker restart success-academy-api
```

### Run Database Migrations
After schema changes, run migrations:
```bash
docker exec -it success-academy-api npm run migrate
```

### Verify Database
Check database connection and data:
```bash
docker exec -it success-academy-api npm run verify-db
```

## License

MIT