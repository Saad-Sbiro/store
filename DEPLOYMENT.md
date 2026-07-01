# Zadi VPS Deployment

Run these commands from the project directory on the VPS after pushing the
latest code to GitHub.

```bash
git pull origin main

npm ci --legacy-peer-deps
npm run build

cd store-backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan storage:link
cd ..
```

Publish the contents of `dist/` as the storefront document root. The existing
web-server rule for `/api/*` must continue forwarding requests to
`store-backend/public/index.php`.

The AI Insights page now sends requests to:

```text
POST /api/admin/ai/chat
```

Do not create an Nginx `/nvidia-api` location. That path was only a local Vite
development proxy and is no longer used.

## Required Laravel Environment

Keep these values in `store-backend/.env` on the VPS:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
FRONTEND_URL=https://your-domain.example
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions
```

Keep the existing database and Telegram variables unchanged. The NVIDIA key is
entered in the protected AI Insights screen and is not stored in Laravel.

After deployment, verify the route:

```bash
cd store-backend
php artisan route:list --path=api/admin/ai
```

It should show `POST api/admin/ai/chat`. A `405` response means the new frontend
was deployed without the new Laravel route, or `/api/*` is not reaching Laravel.
