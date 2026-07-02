<?php

namespace Tests\Feature;

use App\Jobs\ProcessWhatsAppMessage;
use App\Models\Category;
use App\Models\Product;
use App\Models\WhatsAppMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class WhatsAppWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_meta_can_verify_the_webhook(): void
    {
        config(['services.whatsapp.verify_token' => 'verify-me']);

        $this->get('/api/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=verify-me&hub_challenge=123456')
            ->assertOk()
            ->assertSeeText('123456');
    }

    public function test_webhook_verification_rejects_the_wrong_token(): void
    {
        config(['services.whatsapp.verify_token' => 'verify-me']);

        $this->get('/api/webhooks/whatsapp?hub_mode=subscribe&hub_verify_token=wrong&hub_challenge=123456')
            ->assertForbidden();
    }

    public function test_a_signed_message_is_queued_once_when_meta_retries_the_webhook(): void
    {
        Queue::fake();
        config(['services.whatsapp.app_secret' => 'test-app-secret']);
        $payload = $this->incomingPayload();

        $this->signedWebhook($payload)->assertOk()->assertHeader('X-Queued-Messages', '1');
        $this->signedWebhook($payload)->assertOk()->assertHeader('X-Queued-Messages', '0');

        $this->assertDatabaseCount('whatsapp_messages', 1);
        $this->assertDatabaseHas('whatsapp_messages', [
            'message_id' => 'wamid.inbound-1',
            'contact_wa_id' => '212637408252',
            'direction' => 'inbound',
            'body' => 'واش المنتج متوفر؟',
        ]);
        Queue::assertPushed(ProcessWhatsAppMessage::class, 1);
    }

    public function test_an_invalid_webhook_signature_is_rejected(): void
    {
        config(['services.whatsapp.app_secret' => 'test-app-secret']);

        $this->call(
            'POST',
            '/api/webhooks/whatsapp',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalid',
            ],
            json_encode($this->incomingPayload(), JSON_UNESCAPED_UNICODE)
        )->assertUnauthorized();
    }

    public function test_the_job_generates_an_arabic_reply_and_sends_it_to_whatsapp(): void
    {
        config([
            'services.nvidia.api_key' => 'nvidia-test-key',
            'services.nvidia.model' => 'qwen/qwen3-next-80b-a3b-instruct',
            'services.whatsapp.access_token' => 'whatsapp-test-token',
            'services.whatsapp.phone_number_id' => 'phone-number-id',
            'services.whatsapp.graph_version' => 'v23.0',
        ]);

        $category = Category::create([
            'name' => 'Home',
            'slug' => 'home',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Portable fan',
            'name_ar' => 'مروحة محمولة',
            'slug' => 'portable-fan',
            'price' => 199,
            'category_id' => $category->id,
            'images' => [],
            'stock' => 8,
            'is_active' => true,
            'is_featured' => true,
        ]);

        $incoming = WhatsAppMessage::create([
            'message_id' => 'wamid.inbound-2',
            'contact_wa_id' => '212637408252',
            'contact_name' => 'Saad',
            'direction' => 'inbound',
            'type' => 'text',
            'body' => 'شحال ثمن المروحة؟',
            'status' => 'received',
        ]);

        Http::fake([
            'integrate.api.nvidia.com/*' => Http::response([
                'choices' => [[
                    'message' => [
                        'role' => 'assistant',
                        'content' => 'ثمن المروحة المحمولة هو 199 درهم.',
                    ],
                ]],
            ]),
            'graph.facebook.com/*' => Http::response([
                'messages' => [['id' => 'wamid.outbound-1']],
            ]),
        ]);

        ProcessWhatsAppMessage::dispatchSync($incoming->id);

        $this->assertDatabaseHas('whatsapp_messages', [
            'message_id' => 'wamid.inbound-2',
            'status' => 'replied',
        ]);
        $this->assertDatabaseHas('whatsapp_messages', [
            'message_id' => 'wamid.outbound-1',
            'direction' => 'outbound',
            'body' => 'ثمن المروحة المحمولة هو 199 درهم.',
        ]);

        Http::assertSent(fn ($request) => str_contains($request->url(), 'integrate.api.nvidia.com')
            && $request->hasHeader('Authorization', 'Bearer nvidia-test-key')
            && $request['model'] === 'qwen/qwen3-next-80b-a3b-instruct'
            && str_contains($request['messages'][0]['content'], 'مروحة محمولة'));

        Http::assertSent(fn ($request) => str_contains($request->url(), 'graph.facebook.com/v23.0/phone-number-id/messages')
            && $request->hasHeader('Authorization', 'Bearer whatsapp-test-token')
            && $request['to'] === '212637408252'
            && $request['text']['body'] === 'ثمن المروحة المحمولة هو 199 درهم.'
            && $request['context']['message_id'] === 'wamid.inbound-2');
    }

    private function signedWebhook(array $payload)
    {
        $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
        $signature = 'sha256='.hash_hmac('sha256', $json, 'test-app-secret');

        return $this->call(
            'POST',
            '/api/webhooks/whatsapp',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => $signature,
            ],
            $json
        );
    }

    private function incomingPayload(): array
    {
        return [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => 'business-account-id',
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messaging_product' => 'whatsapp',
                        'metadata' => [
                            'display_phone_number' => '15550000000',
                            'phone_number_id' => 'phone-number-id',
                        ],
                        'contacts' => [[
                            'profile' => ['name' => 'Saad'],
                            'wa_id' => '212637408252',
                        ]],
                        'messages' => [[
                            'from' => '212637408252',
                            'id' => 'wamid.inbound-1',
                            'timestamp' => '1782948000',
                            'text' => ['body' => 'واش المنتج متوفر؟'],
                            'type' => 'text',
                        ]],
                    ],
                ]],
            ]],
        ];
    }
}
