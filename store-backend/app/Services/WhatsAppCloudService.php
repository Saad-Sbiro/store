<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class WhatsAppCloudService
{
    public function sendText(string $recipient, string $body, ?string $replyToMessageId = null): array
    {
        $token = (string) config('services.whatsapp.access_token');
        $phoneNumberId = (string) config('services.whatsapp.phone_number_id');

        if ($token === '' || $phoneNumberId === '') {
            throw new RuntimeException('WhatsApp Cloud API credentials are not configured.');
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $recipient,
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $body,
            ],
        ];

        if ($replyToMessageId) {
            $payload['context'] = ['message_id' => $replyToMessageId];
        }

        $version = (string) config('services.whatsapp.graph_version');
        $response = Http::withToken($token)
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.whatsapp.timeout', 15))
            ->retry(2, 500)
            ->post("https://graph.facebook.com/{$version}/{$phoneNumberId}/messages", $payload);

        if ($response->failed()) {
            throw new RuntimeException(
                'WhatsApp Cloud API request failed with status '.$response->status().'.'
            );
        }

        return $response->json() ?: [];
    }
}
