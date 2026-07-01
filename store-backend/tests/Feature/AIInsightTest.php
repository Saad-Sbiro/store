<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AIInsightTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_ai_relay_requires_authentication(): void
    {
        $this->postJson('/api/admin/ai/chat', $this->payload())
            ->assertUnauthorized();
    }

    public function test_the_ai_relay_rejects_non_admin_users(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'customer']));

        $this->postJson('/api/admin/ai/chat', $this->payload())
            ->assertForbidden();
    }

    public function test_an_admin_can_relay_an_ai_request(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        Http::fake([
            'integrate.api.nvidia.com/*' => Http::response([
                'choices' => [[
                    'message' => [
                        'role' => 'assistant',
                        'content' => 'Store insight',
                    ],
                ]],
            ]),
        ]);

        $this->postJson('/api/admin/ai/chat', $this->payload())
            ->assertOk()
            ->assertJsonPath('choices.0.message.content', 'Store insight');

        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer test-key')
            && $request['model'] === 'z-ai/glm-5.1'
            && $request['stream'] === false);
    }

    private function payload(): array
    {
        return [
            'api_key' => 'test-key',
            'model' => 'z-ai/glm-5.1',
            'messages' => [[
                'role' => 'user',
                'content' => 'Analyze the store.',
            ]],
            'temperature' => 0.7,
            'max_tokens' => 2048,
        ];
    }
}
