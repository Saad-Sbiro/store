<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIInsightController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Unauthorized action.');

        $validated = $request->validate([
            'api_key' => 'required|string|max:500',
            'model' => 'required|string|max:150',
            'messages' => 'required|array|min:1|max:40',
            'messages.*.role' => 'required|in:system,user,assistant',
            'messages.*.content' => 'required|string|max:60000',
            'temperature' => 'nullable|numeric|between:0,2',
            'max_tokens' => 'nullable|integer|min:1|max:8192',
        ]);

        $apiKey = $validated['api_key'];
        unset($validated['api_key']);

        $payload = [
            ...$validated,
            'temperature' => $validated['temperature'] ?? 0.7,
            'max_tokens' => $validated['max_tokens'] ?? 2048,
            'stream' => false,
        ];

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout(120)
            ->post(config('services.nvidia.endpoint'), $payload);

        $body = $response->json();
        if (! is_array($body)) {
            $body = [
                'message' => $response->successful()
                    ? 'The AI provider returned an invalid response.'
                    : 'The AI provider request failed.',
            ];
        }

        return response()->json($body, $response->status());
    }
}
