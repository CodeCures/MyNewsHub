# MyNewsHub - Setup Guide

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start

### Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Run migrations and seeders
docker-compose exec app php artisan migrate:fresh --seed
```

Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd frontend

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f frontend
```

Frontend runs on `http://localhost:3000` (not yet implemented)

## Docker Services

### Backend Services

- **app** - PHP 8.4-FPM (Laravel application)
- **nginx** - Nginx web server
- **db** - MySQL 8.0 database
- **redis** - Redis cache and queue
- **queue-worker** - Laravel queue worker
- **scheduler** - Laravel task scheduler

### Frontend Services

- **frontend** - Next.js application

## Seeded Credentials

**Admin:**
- Email: admin@mynewshub.com
- Password: password

**Regular User:**
- Email: user@example.com
- Password: password

## Development

### Backend Commands

```bash
# View logs
docker-compose logs -f app

# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed

# Access container
docker-compose exec app bash

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

### Frontend Commands

```bash
# View logs
docker-compose logs -f frontend

# Access container
docker-compose exec frontend sh

# Restart
docker-compose restart frontend

# Stop
docker-compose down
```

### Database Access

```bash
# Connect to MySQL
docker-compose exec db mysql -u mynewshub -p

# Dump database
docker-compose exec db mysqldump -u mynewshub -p mynewshub > backup.sql
```

### Queue Management

```bash
# View queue worker logs
docker-compose logs -f queue-worker

# Restart queue worker
docker-compose restart queue-worker

# Monitor failed jobs
docker-compose exec app php artisan queue:failed
```

### Seeded Credentials

**Admin:**
- Email: admin@mynewshub.com
- Password: password

**Regular User:**
- Email: user@example.com
- Password: password

### API Testing

Open `backend/api-tests.http` in VS Code with REST Client extension.

1. Run login request (section 1.3)
2. Copy `token` from response
3. Update `@adminToken` variable
4. Test any endpoint

## API Endpoints

**Public:**
- GET `/api/articles` - List articles (paginated, filterable)
- GET `/api/articles/{id}` - Get single article

**Authentication:**
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/user` - Get authenticated user

**Authenticated:**
- GET `/api/articles/personalized/feed` - Personalized feed
- GET `/api/preferences` - Get preferences
- POST `/api/preferences` - Set preferences

**Admin Only:**
- GET `/api/sources` - List sources
- POST `/api/sources` - Create source
- GET `/api/sources/{id}` - Get source
- PUT `/api/sources/{id}` - Update source
- DELETE `/api/sources/{id}` - Delete source
- POST `/api/scrape` - Trigger scraping

## Production Deployment

```bash
# Backend (docker-compose)
cd backend
docker-compose -f docker-compose.production.yml up -d

# Frontend (no docker-compose)
cd ../frontend
docker build -t mynewshub/frontend:prod .
```

## Project Structure

```
MyNewsHub/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Jobs/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── api-tests.http
└── frontend/
    ├── src/
    ├── docker-compose.yml
    └── Dockerfile
```

## Common Issues

**Port already in use:**
```bash
# Change in docker-compose.yml
ports:
  - "8001:8000"  # Backend
  - "3001:3000"  # Frontend
```

**Database connection failed:**
Wait 15 seconds for MySQL to initialize, then restart:
```bash
docker-compose restart app
```

**Permission errors:**
```bash
docker-compose exec app chmod -R 775 storage bootstrap/cache
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

**Reset database:**
```bash
docker-compose exec app php artisan migrate:fresh --seed
```

**Clean up:**
```bash
# Stop containers
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v

# Remove images
docker rmi mynewshub-backend mynewshub-frontend
```
