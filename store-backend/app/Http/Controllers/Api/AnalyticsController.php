<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    /**
     * Log a new user/visitor interaction event.
     */
    public function logEvent(Request $request)
    {
        $validated = $request->validate([
            'event_type' => 'required|string|in:page_view,product_click,add_to_cart,purchase,session_start,session_end',
            'page' => 'nullable|string',
            'product_id' => 'nullable|exists:products,id',
            'time_spent' => 'nullable|integer',
            'metadata' => 'nullable|array',
            'referrer' => 'nullable|string',
        ]);

        $userAgent = $request->userAgent() ?? '';
        $deviceType = 'desktop';

        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/(up\.browser|up\.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/i', $userAgent)) {
            $deviceType = 'mobile';
        }

        $event = AnalyticsEvent::create([
            'event_type' => $validated['event_type'],
            'page' => $validated['page'] ?? null,
            'product_id' => $validated['product_id'] ?? null,
            'user_id' => $request->user()?->id, // If authenticated
            'visitor_ip' => $request->ip(),
            'user_agent' => $userAgent,
            'device_type' => $deviceType,
            'referrer' => $validated['referrer'] ?? $request->header('referer'),
            'time_spent' => $validated['time_spent'] ?? null,
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'event_id' => $event->id
        ], 201);
    }
}
