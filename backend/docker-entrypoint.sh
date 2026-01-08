#!/bin/sh
set -e

# Check if running in staging/production (no bind mounts) or development (bind mounts)
if [ ! -f "/var/www/html/artisan" ]; then
    # Production/Staging: Copy from image to working directory
    echo "Initializing application from image..."
    cp -r /app/. /var/www/html/
    echo "Application files initialized."
fi

# Ensure we're in the right directory
cd /var/www/html

# Check if vendor directory is empty or missing and install dependencies
if [ ! -d "/var/www/html/vendor" ] || [ -z "$(ls -A /var/www/html/vendor 2>/dev/null)" ]; then
    echo "Vendor directory is empty. Installing dependencies..."
    composer install --no-interaction --optimize-autoloader
    echo "Dependencies installed."
fi

# Ensure storage and cache directories exist and have correct permissions
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

# Setup .env if it doesn't exist
if [ ! -f "/var/www/html/.env" ]; then
    echo "Creating .env from .env.example..."
    cp /var/www/html/.env.example /var/www/html/.env

    echo "Generating application key..."
    php artisan key:generate --force

    # Set database and redis configs from environment
    sed -i "s/DB_HOST=.*/DB_HOST=${DB_HOST:-db}/" /var/www/html/.env
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE:-mynewshub}/" /var/www/html/.env
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME:-mynewshub}/" /var/www/html/.env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD:-password}/" /var/www/html/.env
    sed -i "s/REDIS_HOST=.*/REDIS_HOST=${REDIS_HOST:-redis}/" /var/www/html/.env

    echo ".env configuration completed."
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

# Clear caches
echo "Clearing application caches..."
php artisan config:clear || true
php artisan route:clear || true
php artisan cache:clear || true

echo "Application is ready!"

# Execute the main container command (PHP-FPM runs as root, spawns workers as www-data)
exec "$@"
