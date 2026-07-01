<?php

use App\Services\TelegramOrderNotifier;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('telegram:chat-id', function () {
    $telegram = app(TelegramOrderNotifier::class);

    if (blank(config('services.telegram.bot_token'))) {
        $this->error('Set TELEGRAM_BOT_TOKEN in .env first.');

        return 1;
    }

    $chats = $telegram->recentChats();

    if ($chats === []) {
        $this->warn('No chats found. Send /start to your bot, then run this command again.');

        return 1;
    }

    $this->table(['Chat ID', 'Type', 'Name'], $chats);
    $this->newLine();
    $this->info('Copy the correct Chat ID into TELEGRAM_CHAT_ID in .env.');

    return 0;
})->purpose('Find recent Telegram chat IDs for the configured bot');

Artisan::command('telegram:test', function () {
    $telegram = app(TelegramOrderNotifier::class);

    if (! $telegram->isConfigured()) {
        $this->error('Set TELEGRAM_ENABLED=true, TELEGRAM_BOT_TOKEN, and TELEGRAM_CHAT_ID in .env.');

        return 1;
    }

    if (! $telegram->sendTestMessage()) {
        $this->error('Telegram test failed. Check the token, chat ID, and Laravel log.');

        return 1;
    }

    $this->info('Test message sent successfully.');

    return 0;
})->purpose('Send a Telegram workflow test message');

Schedule::command('model:prune')->daily();
