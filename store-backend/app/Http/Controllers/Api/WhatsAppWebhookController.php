<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessWhatsAppMessage;
use App\Models\WhatsAppMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request): Response
    {
        $mode = $request->query('hub_mode', $request->query('hub.mode'));
        $token = $request->query('hub_verify_token', $request->query('hub.verify_token'));
        $challenge = $request->query('hub_challenge', $request->query('hub.challenge'));
        $expectedToken = (string) config('services.whatsapp.verify_token');

        if ($mode !== 'subscribe' || $expectedToken === '' || ! hash_equals($expectedToken, (string) $token)) {
            return response('Webhook verification failed.', 403);
        }

        return response((string) $challenge, 200)
            ->header('Content-Type', 'text/plain');
    }

    public function receive(Request $request): Response
    {
        if (! $this->hasValidSignature($request)) {
            return response('Invalid webhook signature.', 401);
        }

        $queued = 0;

        foreach ($request->input('entry', []) as $entry) {
            foreach (data_get($entry, 'changes', []) as $change) {
                $value = data_get($change, 'value', []);
                $contacts = collect(data_get($value, 'contacts', []))->keyBy('wa_id');

                foreach (data_get($value, 'messages', []) as $messagePayload) {
                    $messageId = data_get($messagePayload, 'id');
                    $contactWaId = data_get($messagePayload, 'from');

                    if (! is_string($messageId) || ! is_string($contactWaId)) {
                        continue;
                    }

                    $type = (string) data_get($messagePayload, 'type', 'unknown');
                    $body = $type === 'text'
                        ? trim((string) data_get($messagePayload, 'text.body'))
                        : null;
                    $contact = $contacts->get($contactWaId, []);

                    $record = WhatsAppMessage::firstOrCreate(
                        ['message_id' => $messageId],
                        [
                            'contact_wa_id' => $contactWaId,
                            'contact_name' => data_get($contact, 'profile.name'),
                            'direction' => 'inbound',
                            'type' => $type,
                            'body' => $body,
                            'status' => 'received',
                            'metadata' => [
                                'phone_number_id' => data_get($value, 'metadata.phone_number_id'),
                            ],
                            'whatsapp_created_at' => data_get($messagePayload, 'timestamp')
                                ? now()->setTimestamp((int) data_get($messagePayload, 'timestamp'))
                                : now(),
                        ]
                    );

                    if ($record->wasRecentlyCreated) {
                        ProcessWhatsAppMessage::dispatch($record->id);
                        $queued++;
                    }
                }
            }
        }

        return response('', 200)->header('X-Queued-Messages', (string) $queued);
    }

    private function hasValidSignature(Request $request): bool
    {
        $appSecret = (string) config('services.whatsapp.app_secret');

        if ($appSecret === '') {
            Log::error('WhatsApp webhook rejected because WHATSAPP_APP_SECRET is not configured.');

            return false;
        }

        $provided = (string) $request->header('X-Hub-Signature-256');
        $expected = 'sha256='.hash_hmac('sha256', $request->getContent(), $appSecret);

        return $provided !== '' && hash_equals($expected, $provided);
    }
}
