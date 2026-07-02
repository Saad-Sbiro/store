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

## WhatsApp AI Auto-Reply

Keep these values in `store-backend/.env`. Never commit them:

```dotenv
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_GRAPH_VERSION=v23.0

NVIDIA_API_KEY=
NVIDIA_AI_MODEL=qwen/qwen3-next-80b-a3b-instruct
```

`WHATSAPP_APP_SECRET` is the app secret from **Meta App Dashboard > Settings >
Basic**. A temporary WhatsApp token is suitable only for initial testing. Use a
system-user token with the `whatsapp_business_messaging` permission in
production.

Run the migration and rebuild Laravel's configuration cache:

```bash
cd /var/www/voidstore/current/store-backend
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

The webhook dispatches replies to the `whatsapp` queue. Install Supervisor and
create `/etc/supervisor/conf.d/zadi-whatsapp.conf`:

```ini
[program:zadi-whatsapp]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/voidstore/current/store-backend/artisan queue:work database --queue=whatsapp,default --sleep=2 --tries=3 --timeout=180
directory=/var/www/voidstore/current/store-backend
user=voidstore
numprocs=1
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
redirect_stderr=true
stdout_logfile=/var/www/voidstore/current/store-backend/storage/logs/whatsapp-worker.log
stopwaitsecs=200
```

Load the worker:

```bash
apt-get install -y supervisor
supervisorctl reread
supervisorctl update
supervisorctl restart zadi-whatsapp:*
supervisorctl status
```

In **Meta App Dashboard > WhatsApp > Configuration**, configure:

```text
Callback URL: https://YOUR_DOMAIN/api/webhooks/whatsapp
Verify token: the exact WHATSAPP_VERIFY_TOKEN value from Laravel
Webhook field: messages
```

The callback must use a valid public HTTPS certificate. After changing any
WhatsApp environment value, run `php artisan config:cache` and restart the
Supervisor worker.
