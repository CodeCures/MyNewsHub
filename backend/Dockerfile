FROM php:8.4-fpm-alpine AS base

WORKDIR /app

# Install system dependencies (Alpine uses apk, not apt-get)
RUN apk add --no-cache \
    bash \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Redis extension (phpredis)
RUN apk add --no-cache --virtual .build-deps \
        autoconf \
        g++ \
        make \
    && pecl channel-update pecl.php.net \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files to /app
COPY . /app

# Install dependencies
RUN composer install --no-interaction --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /app \
    && chmod -R 755 /app/storage \
    && chmod -R 755 /app/bootstrap/cache

# Copy PHP-FPM configuration
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zzz-custom.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www/html

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
