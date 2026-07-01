# Telegram Order Workflow

This workflow sends a Telegram message after a new order has been saved.
Telegram failures never prevent the order from being created.

## Setup

1. Open the verified `@BotFather` account in Telegram.
2. Send `/newbot` and complete the prompts.
3. Add the token to `store-backend/.env`:

```dotenv
TELEGRAM_ENABLED=false
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=
TELEGRAM_TIMEOUT=5
```

4. Open the new bot in Telegram and send `/start`.
5. Discover the chat ID:

```shell
php artisan telegram:chat-id
```

6. Add the displayed ID to `TELEGRAM_CHAT_ID`, then enable the workflow:

```dotenv
TELEGRAM_ENABLED=true
TELEGRAM_CHAT_ID=your_chat_id
```

7. Clear cached configuration and send a test:

```shell
php artisan config:clear
php artisan telegram:test
```

Set the same three Telegram environment variables on the production server.
Never expose the bot token through a `VITE_` variable or frontend code.
