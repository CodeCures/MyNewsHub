#!/bin/sh
set -e

# Copy application code from image to volume if it doesn't exist
if [ ! -f "/var/www/html/artisan" ]; then
    echo "Initializing application code in volume..."
    cp -rp /app/. /var/www/html/
    chown -R www-data:www-data /var/www/html
    chmod -R 775 /var/www/html/storage
    chmod -R 775 /var/www/html/bootstrap/cache
    echo "Application code initialized."
else
    # Ensure storage and cache directories have correct permissions
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
    chmod -R 775 /var/www/html/storage
    chmod -R 775 /var/www/html/bootstrap/cache
fi

# Execute the main container command (PHP-FPM runs as root, spawns workers as www-data)
exec "$@"
