<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CheckoutLead;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutLeadTest extends TestCase
{
    use RefreshDatabase;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.telegram.enabled' => false]);

        $category = Category::create([
            'name' => 'Desk',
            'slug' => 'desk',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'name' => 'Desk Stand',
            'slug' => 'desk-stand',
            'price' => 199.90,
            'category_id' => $category->id,
            'images' => ['https://example.com/stand.jpg'],
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    public function test_it_saves_a_checkout_lead_automatically_without_changing_stock(): void
    {
        $token = (string) Str::uuid();

        $response = $this->postJson('/api/checkout-leads', $this->leadPayload($token));

        $response->assertCreated()
            ->assertJsonPath('lead.status', 'active')
            ->assertJsonPath('lead.phone', '0612345678');

        $this->assertDatabaseHas('checkout_leads', [
            'token' => $token,
            'phone' => '0612345678',
            'status' => 'active',
        ]);
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    public function test_it_does_not_require_a_consent_field_for_checkout_capture(): void
    {
        $payload = $this->leadPayload((string) Str::uuid());

        $this->postJson('/api/checkout-leads', $payload)
            ->assertCreated();

        $this->assertDatabaseCount('checkout_leads', 1);
    }

    public function test_abandonment_sends_one_tagged_telegram_message(): void
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

        $token = (string) Str::uuid();
        $payload = $this->leadPayload($token);
        $payload['abandoned'] = true;

        $this->postJson('/api/checkout-leads', $payload)
            ->assertCreated()
            ->assertJsonPath('lead.status', 'abandoned');

        $this->postJson('/api/checkout-leads', $payload)->assertOk();

        $lead = CheckoutLead::where('token', $token)->firstOrFail();
        $this->assertNotNull($lead->notified_at);

        Http::assertSentCount(1);
        Http::assertSent(fn ($request) => str_contains($request['text'], 'Checkout not submitted')
            && str_contains($request['text'], '0612345678')
            && str_contains($request['text'], 'NOT SUBMITTED MANUALLY'));
    }

    public function test_a_successful_order_converts_the_checkout_lead(): void
    {
        $token = (string) Str::uuid();
        $this->postJson('/api/checkout-leads', $this->leadPayload($token))->assertCreated();

        $response = $this->postJson('/api/orders', [
            'items' => [[
                'product_id' => $this->product->id,
                'quantity' => 1,
                'size' => 'Standard',
            ]],
            'shipping_address' => [
                'name' => 'Test Customer',
                'phone' => '0612345678',
                'street' => '10 Test Street',
                'city' => 'Casablanca',
                'state' => 'Casablanca',
                'country' => 'MA',
            ],
            'payment_method' => 'Cash on Delivery',
            'discount_amount' => 19.90,
            'shipping_cost' => 0,
            'checkout_token' => $token,
        ]);

        $response->assertCreated()
            ->assertJsonPath('order.total', '180.00')
            ->assertJsonPath('order.payment_status', 'pending')
            ->assertJsonPath('order.user_id', null);
        $this->assertDatabaseHas('checkout_leads', [
            'token' => $token,
            'status' => 'converted',
            'order_id' => $response->json('order.id'),
        ]);
    }

    private function leadPayload(string $token): array
    {
        return [
            'token' => $token,
            'full_name' => 'Test Customer',
            'phone' => '06 12 34 56 78',
            'address' => '10 Test Street',
            'city' => 'Casablanca',
            'payment_method' => 'cod',
            'items' => [[
                'product_id' => $this->product->id,
                'quantity' => 1,
                'size' => 'Standard',
            ]],
        ];
    }
}
