<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\TelegramOrderNotifier;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramOrderNotifierTest extends TestCase
{
    public function test_it_sends_a_formatted_order_message(): void
    {
        config([
            'services.telegram.enabled' => true,
            'services.telegram.bot_token' => 'test-token',
            'services.telegram.chat_id' => '123456',
        ]);

        Http::fake([
            'api.telegram.org/*' => Http::response([
                'ok' => true,
                'result' => ['message_id' => 1],
            ]),
        ]);

        $order = new Order([
            'order_number' => 'VS-TEST-0001',
            'total' => 349.90,
            'status' => 'pending',
            'payment_method' => 'Cash on Delivery',
            'shipping_address' => [
                'name' => 'Test Customer',
                'phone' => '0612345678',
                'street' => '10 Test Street',
                'city' => 'Casablanca',
                'country' => 'MA',
            ],
        ]);
        $order->setRelation('items', collect([
            new OrderItem([
                'product_name' => 'Desk Stand',
                'quantity' => 2,
                'size' => 'Standard',
            ]),
        ]));

        $sent = app(TelegramOrderNotifier::class)->sendNewOrder($order);

        $this->assertTrue($sent);
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.telegram.org/bottest-token/sendMessage'
                && $request['chat_id'] === '123456'
                && str_contains($request['text'], 'VS-TEST-0001')
                && str_contains($request['text'], 'Test Customer')
                && str_contains($request['text'], '2x Desk Stand')
                && $request['parse_mode'] === 'HTML';
        });
    }

    public function test_it_skips_notifications_when_not_configured(): void
    {
        config([
            'services.telegram.enabled' => false,
            'services.telegram.bot_token' => null,
            'services.telegram.chat_id' => null,
        ]);
        Http::fake();

        $order = new Order;
        $order->setRelation('items', collect());

        $this->assertFalse(app(TelegramOrderNotifier::class)->sendNewOrder($order));
        Http::assertNothingSent();
    }
}
