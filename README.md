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
│   ├── pages/
│   │   └── Home.jsx          # Home page component
│   ├── styles/
│   │   └── Home.css          # Home page styles
│   ├── App.jsx               # Main app component
│   ├── App.css               # App-level styles
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies and scripts
├── Dockerfile                # Production Dockerfile
├── Dockerfile.dev            # Development Dockerfile
├── docker-compose.yml        # Docker Compose configuration
├── docker-compose.dev.yml    # Development Docker Compose
├── docker-compose.prod.yml   # Production Docker Compose
├── nginx.conf                # Nginx configuration for production
└── .dockerignore             # Docker ignore file
```

## Technologies Used

- React 18
- React Router DOM
- Vite
- CSS3 (Custom properties, Flexbox, Grid)
- Docker & Docker Compose
- Nginx (for production)

## Current Status

- Basic setup complete
- Home page implemented
- Docker configuration (dev & production)
- Additional features coming soon...

## License

MIT