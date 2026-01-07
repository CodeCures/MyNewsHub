# MyNewsHub - Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Git

## Quick Start

### Clone the repository

```bash
git clone <repository-url>
cd MyNewsHub
```

### Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env

# Update .env with your database credentials
DB_DATABASE=mynewshub
DB_USERNAME=mynewshub
DB_PASSWORD=your_password

# Start the backend
docker-compose up -d

# Check logs
docker-compose logs -f
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Start the frontend
docker-compose up -d

# Check logs
docker-compose logs -f
```

Frontend runs on `http://localhost:3000`

## Development

### Backend

**View logs:**
```bash
docker-compose logs app -f
```

**Run migrations:**
```bash
docker exec mynewshub-app php artisan migrate
```

**Access database:**
```bash
docker exec -it mynewshub-db mysql -u mynewshub -p
```

**Restart services:**
```bash
docker-compose restart
```

**Stop services:**
```bash
docker-compose down
```

### Frontend

**View logs:**
```bash
docker-compose logs frontend -f
```

**Restart:**
```bash
docker-compose restart
```

**Stop:**
```bash
docker-compose down
```

## Staging/Production

### Build images

```bash
cd backend
docker build -t mynewshub/api:staging .
docker build -t mynewshub/nginx:staging -f Dockerfile.nginx .

cd ../frontend
docker build -t mynewshub/frontend:staging .
```

### Deploy staging

```bash
cd backend
docker-compose -f docker-compose.staging.yml up -d
```

## Project Structure

```
MyNewsHub/
├── backend/
│   ├── Dockerfile              # PHP/Laravel image
│   ├── Dockerfile.nginx        # Nginx image
│   ├── docker-compose.yml      # Development
│   └── docker-compose.staging.yml  # Staging/Production
├── frontend/
│   ├── Dockerfile              # Next.js image
│   └── docker-compose.yml      # Development
```

## Common Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8081:8080"  # Backend
  - "3001:3000"  # Frontend
```

**Database connection refused:**
Wait 10-15 seconds for MySQL to fully start, then restart the app container:
```bash
docker-compose restart app
```

**Permission errors:**
```bash
docker exec mynewshub-app chmod -R 775 storage bootstrap/cache
docker exec mynewshub-app chown -R www-data:www-data storage bootstrap/cache
```

## Clean Up

**Stop and remove all containers:**
```bash
docker-compose down
```

**Remove volumes (deletes database data):**
```bash
docker-compose down -v
```

**Remove images:**
```bash
docker rmi mynewshub/api:latest mynewshub/frontend:latest
```
