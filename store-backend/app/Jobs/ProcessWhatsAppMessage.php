<?php

namespace App\Jobs;

use App\Models\WhatsAppMessage;
use App\Services\WhatsAppAiResponder;
use App\Services\WhatsAppCloudService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessWhatsAppMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 150;

    public function __construct(public int $whatsAppMessageId)
    {
        $this->onQueue('whatsapp');
    }

    public function backoff(): array
    {
        return [10, 30, 120];
    }

    public function handle(WhatsAppAiResponder $responder, WhatsAppCloudService $whatsApp): void
    {
        $incoming = WhatsAppMessage::find($this->whatsAppMessageId);

        if (! $incoming || $incoming->status === 'replied') {
            return;
        }

        $incoming->update(['status' => 'processing', 'error' => null]);

        try {
            $reply = $responder->replyTo($incoming);
            $result = $whatsApp->sendText(
                $incoming->contact_wa_id,
                $reply,
                $incoming->message_id
            );
            $outboundMessageId = (string) data_get($result, 'messages.0.id');

            WhatsAppMessage::updateOrCreate(
                ['message_id' => $outboundMessageId ?: 'local-'.$incoming->message_id],
                [
                    'contact_wa_id' => $incoming->contact_wa_id,
                    'contact_name' => $incoming->contact_name,
                    'direction' => 'outbound',
                    'type' => 'text',
                    'body' => $reply,
                    'status' => 'sent',
                    'metadata' => ['reply_to' => $incoming->message_id],
                    'whatsapp_created_at' => now(),
                ]
            );

            $incoming->update(['status' => 'replied']);
        } catch (Throwable $exception) {
            $incoming->update([
                'status' => 'failed',
                'error' => mb_substr($exception->getMessage(), 0, 2000),
            ]);

            Log::error('WhatsApp message processing failed.', [
                'message_id' => $incoming->message_id,
                'error' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
